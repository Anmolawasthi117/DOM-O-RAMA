import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Framework Types
export type Framework = 'react' | 'vue' | 'svelte' | 'solid' | 'qwik';
export type SkillLevel = 'junior' | 'senior';
export type AppTheme = 'dark' | 'light';

// Framework Theme Colors
export interface FrameworkTheme {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    icon: string;
    tagline: string;
}

export const frameworkThemes: Record<Framework, FrameworkTheme> = {
    react: {
        name: 'React',
        primary: '#61DAFB',
        secondary: '#282C34',
        accent: '#00D8FF',
        gradient: 'from-cyan-400 to-blue-500',
        icon: '⚛️',
        tagline: 'The Fiber King'
    },
    vue: {
        name: 'Vue',
        primary: '#42B883',
        secondary: '#35495E',
        accent: '#4FC08D',
        gradient: 'from-emerald-400 to-green-600',
        icon: '💚',
        tagline: 'The Compiler'
    },
    svelte: {
        name: 'Svelte',
        primary: '#FF3E00',
        secondary: '#F96743',
        accent: '#FF6B35',
        gradient: 'from-orange-500 to-red-500',
        icon: '🔥',
        tagline: 'The Ghost'
    },
    solid: {
        name: 'SolidJS',
        primary: '#2C4F7C',
        secondary: '#446B9E',
        accent: '#87CEEB',
        gradient: 'from-purple-500 to-indigo-600',
        icon: '💎',
        tagline: 'The Signal'
    },
    qwik: {
        name: 'Qwik',
        primary: '#AC7EF4',
        secondary: '#18B6F6',
        accent: '#E535AB',
        gradient: 'from-pink-500 to-purple-600',
        icon: '⚡',
        tagline: 'The Time Traveler'
    }
};

// Store State Interface
interface AppState {
    // Framework
    currentFramework: Framework;
    setFramework: (framework: Framework) => void;

    // Theme
    appTheme: AppTheme;
    toggleAppTheme: () => void;

    // Skill Level
    skillLevel: SkillLevel;
    setSkillLevel: (level: SkillLevel) => void;

    // Comparison Mode
    comparisonMode: boolean;
    comparisonFramework: Framework | null;
    setComparisonMode: (enabled: boolean, framework?: Framework) => void;

    // Simulation State
    isPlaying: boolean;
    speed: number;
    setIsPlaying: (playing: boolean) => void;
    setSpeed: (speed: number) => void;

    // Current Theme Colors (computed)
    getThemeColors: () => FrameworkTheme;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Framework
            currentFramework: 'react',
            setFramework: (framework) => set({ currentFramework: framework }),

            // Theme
            appTheme: 'dark',
            toggleAppTheme: () => set((state) => ({
                appTheme: state.appTheme === 'dark' ? 'light' : 'dark'
            })),

            // Skill Level
            skillLevel: 'junior',
            setSkillLevel: (level) => set({ skillLevel: level }),

            // Comparison Mode
            comparisonMode: false,
            comparisonFramework: null,
            setComparisonMode: (enabled, framework) => set({
                comparisonMode: enabled,
                comparisonFramework: framework || null
            }),

            // Simulation
            isPlaying: false,
            speed: 500,
            setIsPlaying: (playing) => set({ isPlaying: playing }),
            setSpeed: (speed) => set({ speed }),

            // Computed
            getThemeColors: () => frameworkThemes[get().currentFramework]
        }),
        {
            name: 'dom-o-rama-storage'
        }
    )
);
