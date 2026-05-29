import { type JSX } from "solid-js";
import {
  Zap,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Plus,
  Search,
  FileUp,
  Clipboard,
  FileJson,
  FileCode,
  Share2,
  Download,
} from "lucide";

type IconProps = {
  name: string;
  class?: string;
  style?: JSX.CSSProperties;
};

const iconMap: Record<string, unknown> = {
  zap: Zap,
  "panel-right-close": PanelRightClose,
  "panel-right-open": PanelRightOpen,
  pencil: Pencil,
  "trash-2": Trash2,
  "arrow-left": ArrowLeft,
  "chevron-right": ChevronRight,
  plus: Plus,
  search: Search,
  "file-up": FileUp,
  clipboard: Clipboard,
  "file-json": FileJson,
  "file-code": FileCode,
  "share-2": Share2,
  download: Download,
};

export function Icon(props: IconProps) {
  const iconDef = iconMap[props.name] as Array<[string, Record<string, string>]>;
  if (!iconDef) return null;

  const children = iconDef.map(([tag, attrs]) => {
    switch (tag) {
      case "path":
        return <path {...attrs} />;
      case "circle":
        return <circle {...attrs} />;
      case "rect":
        return <rect {...attrs} />;
      case "line":
        return <line {...attrs} />;
      case "polyline":
        return <polyline {...attrs} />;
      case "polygon":
        return <polygon {...attrs} />;
      default:
        return null;
    }
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class}
      style={props.style}
    >
      {children}
    </svg>
  );
}
