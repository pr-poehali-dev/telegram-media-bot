import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const ADMIN_PASSWORD = ')F?Je}dj1$2x&,~Res7<QvNMEZ&6JvkjT{a!{jVKu?s8qzm4,gDdhf;o7{euHcB:';
const API_URL = 'https://functions.poehali.dev/1b214053-fe8b-4a5c-8bbb-bc561bb87ae1';

interface Download {
  id: number;
  telegram_link: string;
  media_type?: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  status: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telegramLink, setTelegramLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [totalDownloads, setTotalDownloads] = useState(0);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDownloads();
      const interval = setInterval(loadDownloads, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadDownloads = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setDownloads(data);
        setTotalDownloads(data.length);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast.success('Добро пожаловать в админ-панель!');
    } else {
      toast.error('Неверный пароль');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
    toast.success('Вы вышли из системы');
  };

  const handleDownload = async () => {
    if (!telegramLink.trim()) {
      toast.error('Введите ссылку на медиа');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 200);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link: telegramLink }),
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        toast.success('Медиа успешно обработано!');
        setTelegramLink('');
        await loadDownloads();
      } else {
        toast.error(data.error || 'Ошибка скачивания');
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 500);
    }
  };

  const successfulDownloads = downloads.filter(d => d.status === 'completed').length;
  const successRate = totalDownloads > 0 ? ((successfulDownloads / totalDownloads) * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Всего скачиваний', value: totalDownloads.toString(), icon: 'Download', color: 'text-primary' },
    { label: 'Успешных', value: successfulDownloads.toString(), icon: 'CheckCircle', color: 'text-secondary' },
    { label: 'В обработке', value: downloads.filter(d => d.status === 'processing').length.toString(), icon: 'Loader2', color: 'text-accent' },
    { label: 'Успешность', value: `${successRate}%`, icon: 'TrendingUp', color: 'text-secondary' },
  ];

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} д назад`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const serverStatus = [
    { name: 'EU-West-1', load: 45, status: 'healthy', ping: '12ms' },
    { name: 'US-East-1', load: 62, status: 'healthy', ping: '45ms' },
    { name: 'Asia-1', load: 38, status: 'healthy', ping: '89ms' },
    { name: 'EU-Central', load: 71, status: 'warning', ping: '18ms' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 animate-scale-in">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Icon name="Shield" className="text-primary" size={48} />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Админ-панель</h1>
            <p className="text-sm text-muted-foreground">Введите пароль для доступа к управлению</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль администратора</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Введите пароль"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
            </div>
            
            <Button onClick={handleLogin} className="w-full" size="lg">
              <Icon name="LogIn" className="mr-2" size={20} />
              Войти
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
              <p>Доступ к панели управления ограничен. Для получения доступа обратитесь к системному администратору.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <Button size="lg" className="gap-2">
              <Icon name="Plus" size={20} />
              Создать бота
            </Button>
            <Button size="lg" variant="outline" onClick={handleLogout} className="gap-2">
              <Icon name="LogOut" size={20} />
              Выйти
            </Button>
          </div>
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
                {downloads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>История загрузок пуста</p>
                  </div>
                ) : (
                  downloads.map((download) => (
                    <div
                      key={download.id}
                      className="flex items-center justify-between p-4 bg-card/50 rounded-lg hover:bg-card transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          download.status === 'completed' ? 'bg-secondary/10' :
                          download.status === 'processing' ? 'bg-accent/10' : 'bg-destructive/10'
                        }`}>
                          <Icon
                            name={
                              download.status === 'completed' ? 'CheckCircle' :
                              download.status === 'processing' ? 'Loader2' : 'XCircle'
                            }
                            size={24}
                            className={`${
                              download.status === 'completed' ? 'text-secondary' :
                              download.status === 'processing' ? 'text-accent animate-spin' : 'text-destructive'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-md">{download.file_name || 'Обработка...'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(download.file_size)} • {formatTimeAgo(download.created_at)}
                          </p>
                        </div>
                      </div>
                      {download.status === 'completed' && download.file_url ? (
                        <Button size="sm" variant="outline" asChild>
                          <a href={download.file_url} target="_blank" rel="noopener noreferrer">
                            <Icon name="ExternalLink" size={14} className="mr-1" />
                            Открыть
                          </a>
                        </Button>
                      ) : download.status === 'failed' ? (
                        <Badge variant="destructive">
                          <Icon name="XCircle" size={14} className="mr-1" />
                          Ошибка
                        </Badge>
                      ) : (
                        <Badge className="bg-accent/20 text-accent border-accent/30">
                          <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                          Обработка
                        </Badge>
                      )}
                    </div>
                  ))
                )}
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