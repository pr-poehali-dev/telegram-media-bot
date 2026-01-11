CREATE TABLE IF NOT EXISTS t_p2035912_telegram_media_bot.downloads (
    id SERIAL PRIMARY KEY,
    telegram_link TEXT NOT NULL,
    media_type VARCHAR(20),
    file_name TEXT,
    file_size BIGINT,
    file_url TEXT,
    status VARCHAR(20) DEFAULT 'processing',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_downloads_status ON t_p2035912_telegram_media_bot.downloads(status);
CREATE INDEX idx_downloads_created_at ON t_p2035912_telegram_media_bot.downloads(created_at DESC);