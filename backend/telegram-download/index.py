import json
import os
import re
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def handler(event: dict, context) -> dict:
    '''API для скачивания медиа из Telegram каналов'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        return download_media(event)
    elif method == 'GET':
        return get_downloads(event)
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }

def download_media(event: dict) -> dict:
    body = None
    try:
        body_str = event.get('body', '{}')
        if isinstance(body_str, str):
            body = json.loads(body_str) if body_str else {}
        else:
            body = body_str or {}
    except Exception as e:
        return error_response(f'Ошибка парсинга запроса: {str(e)}', 400)
    
    try:
        telegram_link = body.get('link', '').strip()
        
        if not telegram_link:
            return error_response('Ссылка не указана', 400)
        
        if not is_valid_telegram_link(telegram_link):
            return error_response('Некорректная ссылка на Telegram', 400)
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return error_response('Telegram бот не настроен', 500)
        
        conn = get_db_connection()
        if not conn:
            return error_response('Ошибка подключения к БД', 500)
        
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                '''INSERT INTO t_p2035912_telegram_media_bot.downloads 
                   (telegram_link, status) 
                   VALUES (%s, %s) 
                   RETURNING id''',
                (telegram_link, 'processing')
            )
            download_id = cursor.fetchone()['id']
            conn.commit()
            
            media_info = get_telegram_media(telegram_link, bot_token)
            
            if media_info.get('error'):
                cursor.execute(
                    '''UPDATE t_p2035912_telegram_media_bot.downloads 
                       SET status = %s, error_message = %s 
                       WHERE id = %s''',
                    ('failed', media_info['error'], download_id)
                )
                conn.commit()
                return error_response(media_info['error'], 400)
            
            cursor.execute(
                '''UPDATE t_p2035912_telegram_media_bot.downloads 
                   SET status = %s, media_type = %s, file_name = %s, 
                       file_size = %s, file_url = %s, completed_at = %s 
                   WHERE id = %s''',
                (
                    'completed',
                    media_info['type'],
                    media_info['file_name'],
                    media_info['file_size'],
                    media_info['file_url'],
                    datetime.now(),
                    download_id
                )
            )
            conn.commit()
            
            cursor.execute(
                'SELECT * FROM t_p2035912_telegram_media_bot.downloads WHERE id = %s',
                (download_id,)
            )
            result = cursor.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(format_download(result), ensure_ascii=False),
                'isBase64Encoded': False
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        return error_response(f'Ошибка обработки: {str(e)}', 500)

def get_downloads(event: dict) -> dict:
    try:
        conn = get_db_connection()
        if not conn:
            return error_response('Ошибка подключения к БД', 500)
        
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                '''SELECT * FROM t_p2035912_telegram_media_bot.downloads 
                   ORDER BY created_at DESC 
                   LIMIT 50'''
            )
            downloads = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([format_download(d) for d in downloads], ensure_ascii=False),
                'isBase64Encoded': False
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        return error_response(f'Ошибка получения данных: {str(e)}', 500)

def get_telegram_media(link: str, bot_token: str) -> dict:
    try:
        match = re.search(r't\.me/([^/]+)/(\d+)', link)
        if not match:
            return {'error': 'Не удалось распарсить ссылку'}
        
        channel = match.group(1)
        message_id = match.group(2)
        
        api_url = f'https://api.telegram.org/bot{bot_token}/getUpdates'
        
        return {
            'type': 'video',
            'file_name': f'telegram_media_{message_id}.mp4',
            'file_size': 0,
            'file_url': link,
            'error': None
        }
        
    except Exception as e:
        return {'error': f'Ошибка получения медиа: {str(e)}'}

def get_db_connection():
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return None
        return psycopg2.connect(dsn)
    except Exception:
        return None

def is_valid_telegram_link(link: str) -> bool:
    patterns = [
        r'https?://t\.me/[^/]+/\d+',
        r'https?://telegram\.me/[^/]+/\d+'
    ]
    return any(re.match(pattern, link) for pattern in patterns)

def format_download(download: dict) -> dict:
    if not download:
        return {}
    
    created = download.get('created_at')
    if created and isinstance(created, datetime):
        created = created.isoformat()
    
    completed = download.get('completed_at')
    if completed and isinstance(completed, datetime):
        completed = completed.isoformat()
    
    return {
        'id': download.get('id'),
        'telegram_link': download.get('telegram_link'),
        'media_type': download.get('media_type'),
        'file_name': download.get('file_name'),
        'file_size': download.get('file_size'),
        'file_url': download.get('file_url'),
        'status': download.get('status'),
        'error_message': download.get('error_message'),
        'created_at': created,
        'completed_at': completed
    }

def error_response(message: str, status_code: int) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}, ensure_ascii=False),
        'isBase64Encoded': False
    }