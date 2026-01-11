import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const Index = () => {
  const [telegramLink, setTelegramLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = () => {
    if (!telegramLink.trim()) {
      toast.error('Введите ссылку на медиа');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast.success('Медиа успешно загружено!');
          setTelegramLink('');
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const stats = [
    { label: 'Скачиваний сегодня', value: '12,847', icon: 'Download', color: 'text-primary' },
    { label: 'Активных ботов', value: '2,341', icon: 'Bot', color: 'text-secondary' },
    { label: 'Пользователей онлайн', value: '8,192', icon: 'Users', color: 'text-accent' },
    { label: 'Успешность', value: '99.7%', icon: 'TrendingUp', color: 'text-secondary' },
  ];

  const recentDownloads = [
    { id: 1, type: 'video', name: 'video_2026_01_11.mp4', size: '145 MB', time: '2 мин назад', status: 'completed' },
    { id: 2, type: 'photo', name: 'photo_high_res.jpg', size: '8.2 MB', time: '5 мин назад', status: 'completed' },
    { id: 3, type: 'video', name: 'telegram_video.mp4', size: '89 MB', time: '12 мин назад', status: 'completed' },
    { id: 4, type: 'photo', name: 'image_album_01.jpg', size: '5.1 MB', time: '18 мин назад', status: 'completed' },
  ];

  const serverStatus = [
    { name: 'EU-West-1', load: 45, status: 'healthy', ping: '12ms' },
    { name: 'US-East-1', load: 62, status: 'healthy', ping: '45ms' },
    { name: 'Asia-1', load: 38, status: 'healthy', ping: '89ms' },
    { name: 'EU-Central', load: 71, status: 'warning', ping: '18ms' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Icon name="Zap" className="text-primary" size={36} />
              TeleLoad Pro
            </h1>
            <p className="text-muted-foreground mt-1">Enterprise медиа-загрузчик для Telegram</p>
          </div>
          <Button size="lg" className="gap-2">
            <Icon name="Plus" size={20} />
            Создать бота
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon name={stat.icon} className={`${stat.color}`} size={32} />
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Icon name="Link" size={24} />
                Быстрая загрузка
              </h2>
              <p className="text-sm text-muted-foreground">Вставьте ссылку на медиа из Telegram канала</p>
            </div>
            
            <div className="flex gap-3">
              <Input
                placeholder="https://t.me/channel/12345"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                disabled={isProcessing}
                className="flex-1 h-12 text-base"
              />
              <Button onClick={handleDownload} disabled={isProcessing} size="lg" className="px-8">
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                    Загрузка
                  </>
                ) : (
                  <>
                    <Icon name="Download" className="mr-2" size={20} />
                    Скачать
                  </>
                )}
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Обработка медиа...</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </Card>

        <Tabs defaultValue="downloads" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="downloads" className="text-base">
              <Icon name="History" size={18} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="servers" className="text-base">
              <Icon name="Server" size={18} className="mr-2" />
              Серверы
            </TabsTrigger>
            <TabsTrigger value="bots" className="text-base">
              <Icon name="Settings" size={18} className="mr-2" />
              Конфигурация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="downloads" className="mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Clock" size={22} />
                Последние скачивания
              </h3>
              <div className="space-y-3">
                {recentDownloads.map((download) => (
                  <div
                    key={download.id}
                    className="flex items-center justify-between p-4 bg-card/50 rounded-lg hover:bg-card transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${download.type === 'video' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                        <Icon
                          name={download.type === 'video' ? 'Video' : 'Image'}
                          size={24}
                          className={download.type === 'video' ? 'text-primary' : 'text-secondary'}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{download.name}</p>
                        <p className="text-sm text-muted-foreground">{download.size} • {download.time}</p>
                      </div>
                    </div>
                    <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                      <Icon name="Check" size={14} className="mr-1" />
                      Завершено
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="servers" className="mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Activity" size={22} />
                Мониторинг серверов
              </h3>
              <div className="space-y-4">
                {serverStatus.map((server, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${server.status === 'healthy' ? 'bg-secondary' : 'bg-accent'} animate-pulse`} />
                        <span className="font-medium">{server.name}</span>
                        <Badge variant="outline" className="text-xs">{server.ping}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{server.load}% загрузка</span>
                    </div>
                    <Progress value={server.load} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bots" className="mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Sliders" size={22} />
                Создание бота
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Имя бота</label>
                    <Input placeholder="MyTeleLoadBot" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Токен API</label>
                    <Input placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" type="password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Лимит загрузок в час</label>
                    <Input placeholder="1000" type="number" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Регион сервера</label>
                    <select className="w-full h-10 px-3 rounded-md bg-card border border-input">
                      <option>EU-West-1</option>
                      <option>US-East-1</option>
                      <option>Asia-1</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тип подписки</label>
                    <select className="w-full h-10 px-3 rounded-md bg-card border border-input">
                      <option>Free (100 загрузок/день)</option>
                      <option>Pro (5000 загрузок/день)</option>
                      <option>Enterprise (неограничено)</option>
                    </select>
                  </div>
                  <Button className="w-full" size="lg">
                    <Icon name="Rocket" className="mr-2" size={20} />
                    Развернуть бота
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
