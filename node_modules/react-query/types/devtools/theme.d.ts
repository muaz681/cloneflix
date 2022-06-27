export declare const defaultTheme: {
    background: string;
    backgroundAlt: string;
    foreground: string;
    gray: string;
    grayAlt: string;
    inputBackgroundColor: string;
    inputTextColor: string;
    success: string;
    danger: string;
    active: string;
    warning: string;
};
interface ProviderProps {
    theme: typeof defaultTheme;
}
export declare function ThemeProvider({ theme, ...rest }: ProviderProps): JSX.Element;
export declare function useTheme(): {
    background: string;
    backgroundAlt: string;
    foreground: string;
    gray: string;
    grayAlt: string;
    inputBackgroundColor: string;
    inputTextColor: string;
    success: string;
    danger: string;
    active: string;
    warning: string;
};
export {};
