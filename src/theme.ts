import { loadJSON } from "./loaders";

export type ThemeSpec = {
  dark: string,
  light: string,
};

type ThemesSpec = {
  [key: string]: ThemeSpec,
};

type ThemeChangedListener = (theme: ThemeSpec) => void;

class ThemeSelector {
  private selectTheme: HTMLSelectElement;
  private themes: Map<string, ThemeSpec> = new Map();
  private themeChangedListener: ThemeChangedListener = null;

  constructor(id: string, themesSpec: ThemesSpec){
    this.selectTheme = document.querySelector(id);
    for(const [name, theme] of Object.entries(themesSpec)){
      const option = document.createElement('option');
      option.value = option.innerText = name;
      this.selectTheme.add(option);
      this.themes.set(name, theme);
    }
    this.selectTheme.addEventListener('change', () => {
      this.onThemeChanged();
    });
    setTimeout(() => {
      this.onThemeChanged();
    }, 0);
  }
  set onthemechanged(themeChangedListener: ThemeChangedListener){
    this.onThemeChanged();
    this.themeChangedListener = themeChangedListener;
  }
  private onThemeChanged(){
    if(!this.themeChangedListener) return;
    const theme = this.themes.get(this.selectTheme.selectedOptions[0].value);
    this.themeChangedListener(theme);
  }
}

export async function createThemeSelector(id: string, size: number, url: string) : Promise<ThemeSelector> {
  const themesSpec = await loadJSON(url) as ThemesSpec;
  return new ThemeSelector(id, themesSpec);
}