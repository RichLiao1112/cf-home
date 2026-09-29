import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Loader2 } from 'lucide-react';

import {
  ProfileData,
  Category,
  Card,
  NetworkContext,
  AuthSession,
  HeadLayout,
  ThemePreset,
} from './types';
import {
  fetchProfile,
  saveProfile,
  fetchNetworkContext,
  fetchSession,
  createConfigKey,
  deleteConfigKey,
} from './utils/api';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryComponent } from './components/CategoryComponent';
import { CardModal } from './components/CardModal';
import { CategoryModal } from './components/CategoryModal';
import { AppearanceModal } from './components/AppearanceModal';
import { SearchModal } from './components/SearchModal';
import { SnapshotModal } from './components/SnapshotModal';
import { RecycleBinModal } from './components/RecycleBinModal';
import { MigrationModal } from './components/MigrationModal';

export const App: React.FC = () => {
  const [currentKey, setCurrentKey] = useState<string>(() => {
    return localStorage.getItem('cf_home_active_key') || 'default';
  });
  const [configKeys, setConfigKeys] = useState<string[]>(['default', '168']);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [networkContext, setNetworkContext] = useState<NetworkContext>({
    clientIP: '127.0.0.1',
    isPrivate: true,
    networkType: 'lan',
  });
  const [authSession, setAuthSession] = useState<AuthSession>({
    authenticated: true,
    isZeroTrust: false,
  });
  const [loading, setLoading] = useState(true);

  // 主题预设状态：linear (Linear 石墨极客) 或 apple (Apple Pro 纯白毛玻璃)
  const [theme, setTheme] = useState<ThemePreset>(() => {
    try {
      const urlParam = new URLSearchParams(window.location.search).get('theme') as ThemePreset | null;
      if (urlParam === 'linear' || urlParam === 'apple') {
        return urlParam;
      }
    } catch {
      // fallback
    }
    return (localStorage.getItem('cf_home_theme') as ThemePreset) || 'linear';
  });

  const handleThemeChange = (newTheme: ThemePreset) => {
    setTheme(newTheme);
    localStorage.setItem('cf_home_theme', newTheme);
  };

  // 模态窗口状态
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);

  // 正在编辑的实体
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 载入数据
  const loadData = useCallback(async (key?: string) => {
    setLoading(true);
    const targetKey = key || localStorage.getItem('cf_home_active_key') || undefined;
    try {
      const [session, net, res] = await Promise.all([
        fetchSession(),
        fetchNetworkContext(),
        fetchProfile(targetKey),
      ]);
      setAuthSession(session);
      setNetworkContext(net);

      if (res) {
        setCurrentKey(res.key);
        setConfigKeys(res.keys);
        setProfileData(res.data);
        localStorage.setItem('cf_home_active_key', res.key);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 快捷键 Cmd+K / Ctrl+K 搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 保存数据
  const updateData = async (newData: ProfileData) => {
    setProfileData(newData);
    await saveProfile(currentKey, newData);
  };

  // 空间切换与增删
  const handleSwitchKey = (key: string) => {
    if (key !== currentKey) {
      localStorage.setItem('cf_home_active_key', key);
      loadData(key);
    }
  };

  const handleCreateKey = async () => {
    const name = window.prompt('请输入新的空间名称（例如：office / home / lab）：');
    if (!name?.trim()) return;
    const res = await createConfigKey(name.trim());
    if (res.success) {
      loadData(res.key);
    } else {
      alert(res.message || '创建失败');
    }
  };

  const handleDeleteKey = async (key: string) => {
    const res = await deleteConfigKey(key);
    if (res.success) {
      loadData(res.key);
    } else {
      alert(res.message || '删除失败');
    }
  };

  // 分类操作
  const handleSaveCategory = (catData: Partial<Category>) => {
    if (!profileData) return;
    let categories = [...profileData.categories];
    if (editingCategory) {
      categories = categories.map((c) =>
        c.id === editingCategory.id ? ({ ...c, ...catData } as Category) : c
      );
    } else {
      categories.push({
        id: catData.id || crypto.randomUUID(),
        title: catData.title || '新分类',
        color: catData.color || '#3B82F6',
        position: categories.length,
        cards: [],
      });
    }
    updateData({ ...profileData, categories });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!profileData) return;
    const cat = profileData.categories.find((c) => c.id === categoryId);
    if (!cat) return;

    if (
      window.confirm(
        `确定删除分类 "${cat.title}" 吗？其内部的 ${cat.cards.length} 张卡片将移动至回收站。`
      )
    ) {
      const deletedItem = {
        recycleId: crypto.randomUUID(),
        deletedAt: new Date().toISOString(),
        data: cat,
      };

      const newCategories = profileData.categories.filter((c) => c.id !== categoryId);
      const newRecycleBin = {
        ...profileData.recycleBin,
        categories: [deletedItem, ...(profileData.recycleBin?.categories || [])],
      };

      updateData({ ...profileData, categories: newCategories, recycleBin: newRecycleBin });
    }
  };

  // 卡片操作
  const handleOpenAddCard = (categoryId: string) => {
    setEditingCard(null);
    setTargetCategoryId(categoryId);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (card: Card) => {
    setEditingCard(card);
    setTargetCategoryId(card.categoryId);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (card: Card) => {
    if (!profileData) return;

    const categories = profileData.categories.map((cat) => {
      // 从原分类中移除（防止更换分类）
      const filteredCards = cat.cards.filter((c) => c.id !== card.id);

      // 如果目标分类是当前分类，则加入
      if (cat.id === card.categoryId) {
        return {
          ...cat,
          cards: editingCard ? [...filteredCards, card] : [...filteredCards, card],
        };
      }

      return { ...cat, cards: filteredCards };
    });

    updateData({ ...profileData, categories });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!profileData) return;

    let targetCard: Card | null = null;
    let sourceCategoryTitle = '';

    profileData.categories.forEach((cat) => {
      const found = cat.cards.find((c) => c.id === cardId);
      if (found) {
        targetCard = found;
        sourceCategoryTitle = cat.title;
      }
    });

    if (!targetCard) return;

    const deletedItem = {
      recycleId: crypto.randomUUID(),
      deletedAt: new Date().toISOString(),
      sourceCategoryId: (targetCard as Card).categoryId,
      sourceCategoryTitle,
      data: targetCard,
    };

    const categories = profileData.categories.map((cat) => ({
      ...cat,
      cards: cat.cards.filter((c) => c.id !== cardId),
    }));

    const newRecycleBin = {
      ...profileData.recycleBin,
      cards: [deletedItem, ...(profileData.recycleBin?.cards || [])],
    };

    updateData({ ...profileData, categories, recycleBin: newRecycleBin });
  };

  // 回收站恢复
  const handleRestoreCategory = (recycleId: string) => {
    if (!profileData) return;
    const item = profileData.recycleBin.categories.find((c) => c.recycleId === recycleId);
    if (!item) return;

    const categories = [...profileData.categories, item.data];
    const recycleCategories = profileData.recycleBin.categories.filter(
      (c) => c.recycleId !== recycleId
    );

    updateData({
      ...profileData,
      categories,
      recycleBin: { ...profileData.recycleBin, categories: recycleCategories },
    });
  };

  const handleRestoreCard = (recycleId: string) => {
    if (!profileData) return;
    const item = profileData.recycleBin.cards.find((c) => c.recycleId === recycleId);
    if (!item) return;

    let restored = false;
    const categories = profileData.categories.map((cat) => {
      if (cat.id === item.sourceCategoryId) {
        restored = true;
        return { ...cat, cards: [...cat.cards, item.data] };
      }
      return cat;
    });

    // 如果原分类已被删除，则恢复到第一个分类中
    if (!restored && categories[0]) {
      categories[0] = { ...categories[0], cards: [...categories[0].cards, item.data] };
    }

    const recycleCards = profileData.recycleBin.cards.filter((c) => c.recycleId !== recycleId);

    updateData({
      ...profileData,
      categories,
      recycleBin: { ...profileData.recycleBin, cards: recycleCards },
    });
  };

  const handleClearRecycleBin = () => {
    if (!profileData) return;
    updateData({
      ...profileData,
      recycleBin: { categories: [], cards: [] },
    });
  };

  // 外观保存
  const handleSaveAppearance = (head: HeadLayout) => {
    if (!profileData) return;
    updateData({
      ...profileData,
      layout: { head },
    });
  };

  // 拖拽排序处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !profileData) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // 寻找卡片所在的分类
    let activeCategory: Category | undefined;
    let overCategory: Category | undefined;

    profileData.categories.forEach((cat) => {
      if (cat.cards.some((c) => c.id === activeId)) activeCategory = cat;
      if (cat.cards.some((c) => c.id === overId)) overCategory = cat;
    });

    if (!activeCategory || !overCategory) return;

    // 1. 同一分类内的排序
    if (activeCategory.id === overCategory.id) {
      const oldIndex = activeCategory.cards.findIndex((c) => c.id === activeId);
      const newIndex = activeCategory.cards.findIndex((c) => c.id === overId);

      const reorderedCards = arrayMove(activeCategory.cards, oldIndex, newIndex);
      const categories = profileData.categories.map((cat) =>
        cat.id === activeCategory!.id ? { ...cat, cards: reorderedCards } : cat
      );
      updateData({ ...profileData, categories });
    }
  };

  // 样式变量注入
  const head = profileData?.layout?.head;
  const overlayOpacity = Math.min(Math.max(head?.overlayOpacity ?? 70, 0), 100);
  const cardOpacityVal = ((head?.cardOpacity ?? 5) / 100).toFixed(2);
  const cardHoverOpacityVal = Math.min((head?.cardOpacity ?? 5) / 100 + 0.08, 0.35).toFixed(2);
  const navOpacityVal = ((head?.navOpacity ?? 62) / 100).toFixed(2);

  const styleVariables = useMemo(
    () =>
      ({
        '--nav-opacity': navOpacityVal,
        '--card-opacity': cardOpacityVal,
        '--card-hover-opacity': cardHoverOpacityVal,
      } as React.CSSProperties),
    [navOpacityVal, cardOpacityVal, cardHoverOpacityVal]
  );

  const totalCards = useMemo(() => {
    return profileData?.categories.reduce((acc, cat) => acc + cat.cards.length, 0) || 0;
  }, [profileData]);

  const displayedCategories = useMemo(() => {
    if (!profileData?.categories) return [];
    if (!activeCategory) return profileData.categories;
    return profileData.categories.filter((c) => c.id === activeCategory);
  }, [profileData, activeCategory]);

  if (loading && !profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div
      style={styleVariables}
      className="min-h-screen bg-[#030712] text-slate-100 relative selection:bg-cyan-500/30 font-sans"
    >
      {/* 细腻环境光晕底板（根据主题自适应低饱和冷夜或纯净毛玻璃） */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none opacity-80 ${
          theme === 'apple' ? 'bg-mesh-apple' : 'bg-mesh-linear'
        }`}
      />

      {/* 自定义背景壁纸层 */}
      {head?.backgroundImage && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${head.backgroundImage})` }}
        />
      )}

      {/* 磨砂暗色遮罩 */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-all duration-300"
        style={{
          backgroundColor: `rgba(3, 7, 18, ${overlayOpacity / 100})`,
          WebkitBackdropFilter: head?.backgroundBlur ? `blur(${head.backgroundBlur}px)` : undefined,
          backdropFilter: head?.backgroundBlur ? `blur(${head.backgroundBlur}px)` : undefined,
        }}
      />

      {/* 主界面内容 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          headLayout={head || { name: 'Home', desktopColumns: 4, backgroundBlur: 0, cardOpacity: 5, categoryOpacity: 5, navOpacity: 62, overlayOpacity: 70 }}
          currentKey={currentKey}
          configKeys={configKeys}
          networkContext={networkContext}
          authSession={authSession}
          theme={theme}
          onThemeChange={handleThemeChange}
          onSwitchKey={handleSwitchKey}
          onCreateKey={handleCreateKey}
          onDeleteKey={handleDeleteKey}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSnapshot={() => setIsSnapshotOpen(true)}
          onOpenAppearance={() => setIsAppearanceOpen(true)}
          onOpenRecycleBin={() => setIsRecycleBinOpen(true)}
          onOpenMigration={() => setIsMigrationOpen(true)}
          onAddCategory={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
        />

        <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <HeroSection
            networkContext={networkContext}
            categories={profileData?.categories || []}
            totalCards={totalCards}
            theme={theme}
            onOpenSearch={() => setIsSearchOpen(true)}
            activeCategory={activeCategory}
            onSelectCategory={(id) => setActiveCategory(id)}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {displayedCategories.map((category) => (
              <CategoryComponent
                key={category.id}
                category={category}
                desktopColumns={head?.desktopColumns || 4}
                networkContext={networkContext}
                theme={theme}
                onAddCard={handleOpenAddCard}
                onEditCategory={(c) => {
                  setEditingCategory(c);
                  setIsCategoryModalOpen(true);
                }}
                onDeleteCategory={handleDeleteCategory}
                onEditCard={handleOpenEditCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </DndContext>
        </main>
      </div>

      {/* 模态弹窗集合 */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        categories={profileData?.categories || []}
        networkContext={networkContext}
      />

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        categories={profileData?.categories || []}
        initialCard={editingCard}
        targetCategoryId={targetCategoryId}
        onSave={handleSaveCard}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialCategory={editingCategory}
        onSave={handleSaveCategory}
      />

      <AppearanceModal
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
        initialLayout={
          head || {
            name: 'Home',
            desktopColumns: 4,
            backgroundBlur: 0,
            cardOpacity: 5,
            categoryOpacity: 5,
            navOpacity: 62,
            overlayOpacity: 70,
          }
        }
        onSave={handleSaveAppearance}
      />

      <SnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        currentKey={currentKey}
        onRestoreSuccess={() => loadData(currentKey)}
      />

      <RecycleBinModal
        isOpen={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
        recycleBin={profileData?.recycleBin || { categories: [], cards: [] }}
        onRestoreCategory={handleRestoreCategory}
        onRestoreCard={handleRestoreCard}
        onClearAll={handleClearRecycleBin}
      />

      <MigrationModal
        isOpen={isMigrationOpen}
        onClose={() => setIsMigrationOpen(false)}
        onImportSuccess={() => loadData(currentKey)}
      />
    </div>
  );
};
