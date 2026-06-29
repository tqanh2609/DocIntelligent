
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Home as HomeIcon, MessageSquare, FileText, Upload, ChevronRight, X, Send, Plus, 
  Trash2, Download, Copy, User, Key, BookOpen, BarChart3, CreditCard, Code,
  Eye, Layers, Scissors, MessageCircle, MoreVertical, ExternalLink,
  ZoomIn, ZoomOut, Maximize, MousePointer2, Move, Database, Sparkles, Check, 
  ChevronDown, ListFilter, LayoutGrid, Info, Settings, LogOut, Calendar, TrendingUp,
  FileSearch, UserCircle, Camera, Briefcase, MapPin, Building2, Zap, Image as ImageIcon,
  ChevronLeft, Hash, Loader2, Network, Minus, RefreshCw, Circle, CheckCircle, AlertTriangle, FileSpreadsheet,
  ChevronUp, Activity, Table as TableIcon, GripVertical, Moon, Sun, Globe, Cpu, Languages
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  Segment, ChatMessage, FileEntry, ApiKeyEntry, FieldSuggestion, 
  ExtractionResult, SplitTypeConfig, DocumentSplit, SplitExtractionResult, 
  FileSession, UserProfile, MindMapNode, ValidationResults, AppSettings 
} from './types';
import { 
  parseDocumentWithGemini, chatWithDocument, suggestFields, 
  extractFields, performDocumentSplit, suggestSplitConfigs, generateMindMap,
  performSemanticValidation, compareTableData, translateResults
} from './services/geminiService';

// i18n support - Comprehensive localization dictionary
const TRANSLATIONS: Record<string, any> = {
  en: {
    home: "Home",
    history: "History",
    settings: "Settings",
    newUpload: "New Upload",
    docs: "Docs",
    extract: "Extract",
    fields: "Fields",
    assistant: "Assistant",
    split: "Split",
    mindmap: "MindMap",
    validation: "Validation",
    general: "General",
    models: "Models",
    apiKeys: "API Keys",
    theme: "System Theme",
    language: "Interface Language",
    profile: "Account Profile",
    credits: "Credits",
    analyze: "Analyze Document",
    ready: "Ready to Process",
    choose: "Choose Document",
    appearance: "Appearance",
    i18n: "Language Settings",
    light: "Light",
    dark: "Dark",
    save: "Save Changes",
    modelSelection: "Model Selection",
    modelDesc: "Configure which Gemini model powers your extractions.",
    apiKeyInput: "Personal API Key (Optional)",
    apiKeyPlaceholder: "Enter your API key for this model...",
    usingSystemKey: "Using system default key",
    maskedKey: "Key configured (masked)",
    suggestFields: "Suggest Extraction Fields",
    uploadJson: "Upload JSON Template",
    extractFields: "Extract Fields",
    suggestSplits: "Suggest Splits with AI",
    addRule: "Add Rule",
    categorizeSplit: "Categorize & Split",
    generateMindMap: "Generate MindMap",
    tableValidation: "Table Validation",
    fieldsReasoning: "Fields Reasoning",
    activeSession: "Active Session",
    noFile: "NO FILE",
    landingDesc: "Upload any PDF research paper, technical report, or image file to begin visual extraction.",
    validationTitle: "VALIDATION WORKSTATION",
    validationDesc: "Cross-check document against external data.",
    uploadRefDataset: "UPLOAD REFERENCE DATASET",
    uploadRefDesc: "Excel (.xlsx) or CSV for deep matching",
    premiumPlan: "Premium Plan",
    askPlaceholder: "Ask about the content...",
    assistantReady: "Assistant Ready",
    splitDesc: "Organize multi-part files.",
    mindmapDesc: "Visualize document hierarchy.",
    accuracyRating: "Accuracy Rating",
    comparing: "Comparing...",
    fieldKey: "Field Key",
    fieldDesc: "Description...",
    splitType: "Split Type",
    splitId: "ID Key (Optional)",
    results: "Results",
    signOut: "Sign Out",
    themeDesc: "Toggle between light and dark display modes.",
    langDesc: "Choose your preferred interface language.",
    original: "Original",
    translated: "Translated"
  },
  es: {
    home: "Inicio",
    history: "Historial",
    settings: "Configuración",
    newUpload: "Carga Nueva",
    docs: "Docs",
    extract: "Extraer",
    fields: "Campos",
    assistant: "Asistente",
    split: "Dividir",
    mindmap: "Mapa Mental",
    validation: "Validación",
    general: "General",
    models: "Modelos",
    apiKeys: "Llaves API",
    theme: "Tema del Sistema",
    language: "Idioma de Interfaz",
    profile: "Perfil de Cuenta",
    credits: "Créditos",
    analyze: "Analizar Documento",
    ready: "Listo para Procesar",
    choose: "Elegir Documento",
    appearance: "Apariencia",
    i18n: "Configuración de Idioma",
    light: "Claro",
    dark: "Oscuro",
    save: "Guardar Cambios",
    modelSelection: "Selección de Modelo",
    modelDesc: "Configure qué modelo de Gemini potencia sus extracciones.",
    apiKeyInput: "Llave API Personal (Opcional)",
    apiKeyPlaceholder: "Ingrese su llave API para este modelo...",
    usingSystemKey: "Usando llave por defecto",
    maskedKey: "Llave configurada (oculta)",
    suggestFields: "Sugerir Campos de Extracción",
    uploadJson: "Cargar Plantilla JSON",
    extractFields: "Extraer Campos",
    suggestSplits: "Sugerir Divisiones con IA",
    addRule: "Agregar Regla",
    categorizeSplit: "Categorizar y Dividir",
    generateMindMap: "Generar Mapa Mental",
    tableValidation: "Validación de Tabla",
    fieldsReasoning: "Razonamiento de Campos",
    activeSession: "Sesión Activa",
    noFile: "SIN ARCHIVO",
    landingDesc: "Cargue cualquier documento PDF, informe técnico o imagen para comenzar la extracción visual.",
    validationTitle: "ESTACIÓN DE VALIDACIÓN",
    validationDesc: "Verifique el documento contra datos externos.",
    uploadRefDataset: "CARGAR CONJUNTO DE DATOS",
    uploadRefDesc: "Excel (.xlsx) o CSV para coincidencia profunda",
    premiumPlan: "Plan Premium",
    askPlaceholder: "Pregunte sobre el contenido...",
    assistantReady: "Asistente Listo",
    splitDesc: "Organice archivos multiparte.",
    mindmapDesc: "Visualice la jerarquía del documento.",
    accuracyRating: "Índice de Precisión",
    comparing: "Comparando...",
    fieldKey: "Nombre de Campo",
    fieldDesc: "Descripción...",
    splitType: "Tipo de División",
    splitId: "Clave de ID (Opcional)",
    results: "Resultados",
    signOut: "Cerrar Sesión",
    themeDesc: "Cambie entre los modos de visualización claro y oscuro.",
    langDesc: "Elija su idioma de interfaz preferido.",
    original: "Original",
    translated: "Traducido"
  },
  zh: {
    home: "首页",
    history: "历史",
    settings: "设置",
    newUpload: "新上传",
    docs: "文档",
    extract: "提取",
    fields: "字段",
    assistant: "助手",
    split: "拆分",
    mindmap: "思维导图",
    validation: "验证",
    general: "常规",
    models: "模型",
    apiKeys: "API 密钥",
    theme: "系统主题",
    language: "界面语言",
    profile: "账户个人资料",
    credits: "积分",
    analyze: "分析文档",
    ready: "准备处理",
    choose: "选择文档",
    appearance: "外观",
    i18n: "语言设置",
    light: "浅色",
    dark: "深色",
    save: "保存更改",
    modelSelection: "模型选择",
    modelDesc: "配置哪个 Gemini 模型支持您的提取。",
    apiKeyInput: "个人 API 密钥 (可选)",
    apiKeyPlaceholder: "输入此模型的 API 密钥...",
    usingSystemKey: "使用系统默认密钥",
    maskedKey: "密钥已配置 (已隐藏)",
    suggestFields: "建议提取字段",
    uploadJson: "上传 JSON 模板",
    extractFields: "提取字段",
    suggestSplits: "使用 AI 建议拆分",
    addRule: "添加规则",
    categorizeSplit: "分类并拆分",
    generateMindMap: "生成思维导图",
    tableValidation: "表格验证",
    fieldsReasoning: "字段推理",
    activeSession: "当前会话",
    noFile: "未选择文件",
    landingDesc: "上传任何 PDF 研究论文、技术报告 or 图像文件以开始视觉提取。",
    validationTitle: "验证工作站",
    validationDesc: "将文档与外部数据进行交叉核对。",
    uploadRefDataset: "上传参考数据集",
    uploadRefDesc: "Excel (.xlsx) 或 CSV 用于深度匹配",
    premiumPlan: "高级计划",
    askPlaceholder: "询问内容...",
    assistantReady: "助手就绪",
    splitDesc: "组织多部分文件。",
    mindmapDesc: "可视化文档层次结构。",
    accuracyRating: "准确率评分",
    comparing: "比较中...",
    fieldKey: "字段键",
    fieldDesc: "描述...",
    splitType: "拆分类型",
    splitId: "ID 键 (可选)",
    results: "结果",
    signOut: "退出登录",
    themeDesc: "在浅色和深色显示模式之间切换。",
    langDesc: "选择您偏好的界面语言。",
    original: "原件",
    translated: "翻译"
  },
  de: {
    home: "Startseite",
    history: "Verlauf",
    settings: "Einstellungen",
    newUpload: "Neuer Upload",
    docs: "Dokumente",
    extract: "Extrahieren",
    fields: "Felder",
    assistant: "Assistent",
    split: "Teilen",
    mindmap: "MindMap",
    validation: "Validierung",
    general: "Allgemein",
    models: "Modelle",
    apiKeys: "API-Keys",
    theme: "System-Design",
    language: "Sprache",
    profile: "Kontoprofil",
    credits: "Guthaben",
    analyze: "Dokument analysieren",
    ready: "Bereit zur Bearbeitung",
    choose: "Dokument auswählen",
    appearance: "Erscheinungsbild",
    i18n: "Spracheinstellungen",
    light: "Hell",
    dark: "Dunkel",
    save: "Änderungen speichern",
    modelSelection: "Modellauswahl",
    modelDesc: "Konfigurieren Sie das Gemini-Modell für Ihre Extraktionen.",
    apiKeyInput: "Eigener API-Key (Optional)",
    apiKeyPlaceholder: "API-Key für dieses Modell eingeben...",
    usingSystemKey: "System-Key aktiv",
    maskedKey: "Key konfiguriert (maskiert)",
    suggestFields: "Extraktionsfelder vorschlagen",
    uploadJson: "JSON-Vorlage laden",
    extractFields: "Felder extrahieren",
    suggestSplits: "Splits mit KI vorschlagen",
    addRule: "Regel hinzufügen",
    categorizeSplit: "Kategorisieren & Teilen",
    generateMindMap: "MindMap erstellen",
    tableValidation: "Tabellenvalidierung",
    fieldsReasoning: "Feldlogik",
    activeSession: "Aktive Sitzung",
    noFile: "KEINE DATEI",
    landingDesc: "PDFs, Berichte oder Bilder für die Analyse hochladen.",
    validationTitle: "VALIDIERUNGSSTATION",
    validationDesc: "Dokument gegen externe Daten prüfen.",
    uploadRefDataset: "REFERENZDATEN LADEN",
    uploadRefDesc: "Excel (.xlsx) oder CSV für Abgleich",
    premiumPlan: "Premium-Tarif",
    askPlaceholder: "Fragen zum Inhalt stellen...",
    assistantReady: "Assistent bereit",
    splitDesc: "Mehrteilige Dateien organisieren.",
    mindmapDesc: "Struktur visualisieren.",
    accuracyRating: "Genauigkeit",
    comparing: "Vergleiche...",
    fieldKey: "Feld-Schlüssel",
    fieldDesc: "Beschreibung...",
    splitType: "Split-Typ",
    splitId: "ID-Key (Optional)",
    results: "Ergebnisse",
    signOut: "Abmelden",
    themeDesc: "Zwischen hellem und dunklem Design wählen.",
    langDesc: "Wählen Sie Ihre bevorzugte Oberflächensprache.",
    original: "Original",
    translated: "Übersetzt"
  },
  ko: {
    home: "홈",
    history: "기록",
    settings: "설정",
    newUpload: "새 업로드",
    docs: "문서",
    extract: "추출",
    fields: "필드",
    assistant: "어시스턴트",
    split: "분할",
    mindmap: "마인드맵",
    validation: "검증",
    general: "일반",
    models: "모델",
    apiKeys: "API 키",
    theme: "테마 설정",
    language: "인터페이스 언어",
    profile: "계정 프로필",
    credits: "크레딧",
    analyze: "문서 분석",
    ready: "준비 완료",
    choose: "문서 선택",
    appearance: "모양",
    i18n: "언어 설정",
    light: "라이트",
    dark: "다크",
    save: "변경 사항 저장",
    modelSelection: "모델 선택",
    modelDesc: "추출을 지원할 Gemini 모델을 구성합니다.",
    apiKeyInput: "개인 API 키 (선택 사항)",
    apiKeyPlaceholder: "API 키를 입력하세요...",
    usingSystemKey: "시스템 기본 키 사용 중",
    maskedKey: "키 구성됨 (마스킹됨)",
    suggestFields: "추출 필드 제안",
    uploadJson: "JSON 템플릿 업로드",
    extractFields: "필드 추출",
    suggestSplits: "AI로 분할 제안",
    addRule: "규칙 추가",
    categorizeSplit: "분류 및 분할",
    generateMindMap: "마인드맵 생성",
    tableValidation: "테이블 검증",
    fieldsReasoning: "필드 추론",
    activeSession: "활성 세션",
    noFile: "파일 없음",
    landingDesc: "PDF 연구 논문, 기술 보고서 또는 이미지를 업로드하여 시작하세요.",
    validationTitle: "검증 워크스테이션",
    validationDesc: "문서와 외부 데이터를 교차 검증합니다.",
    uploadRefDataset: "참조 데이터셋 업로드",
    uploadRefDesc: "Excel (.xlsx) 또는 CSV 파일",
    premiumPlan: "프리미엄 플랜",
    askPlaceholder: "내용에 대해 질문하세요...",
    assistantReady: "어시스턴트 준비됨",
    splitDesc: "다중 파트 파일을 정리합니다.",
    mindmapDesc: "문서 계층 구조를 시각화합니다.",
    accuracyRating: "정확도 평가",
    comparing: "비교 중...",
    fieldKey: "필드 키",
    fieldDesc: "설명...",
    splitType: "분할 유형",
    splitId: "ID 키 (선택 사항)",
    results: "결과",
    signOut: "로그아웃",
    themeDesc: "라이트 모드와 다크 모드 중 선택하세요.",
    langDesc: "선호하는 인터페이스 언어를 선택하세요.",
    original: "원본",
    translated: "번역됨"
  },
  ja: {
    home: "ホーム",
    history: "履歴",
    settings: "設定",
    newUpload: "新規アップロード",
    docs: "ドキュメント",
    extract: "抽出",
    fields: "フィールド",
    assistant: "アシスタント",
    split: "分割",
    mindmap: "マインドマップ",
    validation: "検証",
    general: "一般",
    models: "モデル",
    apiKeys: "APIキー",
    theme: "システムテーマ",
    language: "インターフェース言語",
    profile: "アカウントプロファイル",
    credits: "クレジット",
    analyze: "ドキュメントを分析",
    ready: "準備完了",
    choose: "ドキュメントを選択",
    appearance: "外観",
    i18n: "言語設定",
    light: "ライト",
    dark: "ダーク",
    save: "変更を保存",
    modelSelection: "モデル選択",
    modelDesc: "抽出に使用する Gemini モデルを設定します。",
    apiKeyInput: "個人用 API キー (任意)",
    apiKeyPlaceholder: "API キーを入力...",
    usingSystemKey: "시스템키 사용중",
    maskedKey: "キー設定済み (マスク)",
    suggestFields: "抽出フィールドを提案",
    uploadJson: "JSONテンプレートをロード",
    extractFields: "フィールドを抽出",
    suggestSplits: "AIで分割を提案",
    addRule: "ルールを追加",
    categorizeSplit: "分類して分割",
    generateMindMap: "マインドマップを生成",
    tableValidation: "テーブル検証",
    fieldsReasoning: "フィールド推論",
    activeSession: "アクティブなセッション",
    noFile: "ファイルがありません",
    landingDesc: "PDF、テクニカルレポート、または画像をアップロードして分析を開始します。",
    validationTitle: "検証ワークステーション",
    validationDesc: "ドキュメントを外部データと照合します。",
    uploadRefDataset: "参照データセットをアップロード",
    uploadRefDesc: "Excel (.xlsx) または CSV",
    premiumPlan: "プレミアムプラン",
    askPlaceholder: "内容について質問する...",
    assistantReady: "アシスタント準備完了",
    splitDesc: "複数パーツのファイルを整理します。",
    mindmapDesc: "階層を視覚化します。",
    accuracyRating: "精度評価",
    comparing: "比較中...",
    fieldKey: "フィールド名",
    fieldDesc: "説明...",
    splitType: "分割タイプ",
    splitId: "IDキー (任意)",
    results: "結果",
    signOut: "サインアウト",
    themeDesc: "ライトモードとダークモードを切り替えます。",
    langDesc: "希望のインターフェース言語を選択してください。",
    original: "原文",
    translated: "翻訳"
  },
  vi: {
    home: "Trang chủ",
    history: "Lịch sử",
    settings: "Cài đặt",
    newUpload: "Tải lên mới",
    docs: "Tài liệu",
    extract: "Trích xuất",
    fields: "Trường dữ liệu",
    assistant: "Trợ lý",
    split: "Chia tách",
    mindmap: "Sơ đồ tư duy",
    validation: "Xác thực",
    general: "Chung",
    models: "Mô hình",
    apiKeys: "Khóa API",
    theme: "Giao diện hệ thống",
    language: "Ngôn ngữ giao diện",
    profile: "Hồ sơ cá nhân",
    credits: "Tín dụng",
    analyze: "Phân tích tài liệu",
    ready: "Sẵn sàng xử lý",
    choose: "Chọn tài liệu",
    appearance: "Giao diện",
    i18n: "Cài đặt ngôn ngữ",
    light: "Sáng",
    dark: "Tối",
    save: "Lưu thay đổi",
    modelSelection: "Lựa chọn mô hình",
    modelDesc: "Cấu hình mô hình Gemini cho việc trích xuất.",
    apiKeyInput: "Khóa API cá nhân (Tùy chọn)",
    apiKeyPlaceholder: "Nhập khóa API...",
    usingSystemKey: "Đang dùng khóa hệ thống",
    maskedKey: "Khóa đã cấu hình (ẩn)",
    suggestFields: "Đề xuất trường",
    uploadJson: "Tải lên mẫu JSON",
    extractFields: "Trích xuất trường",
    suggestSplits: "Đề xuất chia tách",
    addRule: "Thêm quy tắc",
    categorizeSplit: "Phân loại & Chia tách",
    generateMindMap: "Tạo sơ đồ tư duy",
    tableValidation: "Xác thực bảng",
    fieldsReasoning: "Lập luận trường",
    activeSession: "Phiên làm việc",
    noFile: "CHƯA CÓ FILE",
    landingDesc: "Tải lên tài liệu PDF hoặc hình ảnh để bắt đầu trích xuất dữ liệu.",
    validationTitle: "TRẠM XÁC THỰC",
    validationDesc: "Đối soát tài liệu với dữ liệu bên ngoài.",
    uploadRefDataset: "TẢI LÊN BỘ DỮ LIỆU THAM CHIẾU",
    uploadRefDesc: "Excel (.xlsx) hoặc CSV",
    premiumPlan: "Gói Premium",
    askPlaceholder: "Đặt câu hỏi về nội dung...",
    assistantReady: "Trợ lý đã sẵn sàng",
    splitDesc: "Tổ chức các tập tin nhiều phần.",
    mindmapDesc: "Trực quan hóa cấu trúc tài liệu.",
    accuracyRating: "Đánh giá độ chính xác",
    comparing: "Đang đối soát...",
    fieldKey: "Khóa trường",
    fieldDesc: "Mô tả...",
    splitType: "Loại chia tách",
    splitId: "Khóa ID (Tùy chọn)",
    results: "Kết quả",
    signOut: "Đăng xuất",
    themeDesc: "Chuyển đổi giữa chế độ sáng và tối.",
    langDesc: "Chọn ngôn ngữ giao diện ưa thích của bạn.",
    original: "Gốc",
    translated: "Đã dịch"
  }
};

const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Latest)', description: 'Fast and efficient for general extraction.' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Preview)', description: 'Complex reasoning and high-precision extraction.' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite', description: 'Lowest latency for high-speed processing.' }
];

const PALETTE = [
  { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', active: 'border-blue-500', hex: '#2563eb' },
  { text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', active: 'border-teal-500', hex: '#0d9488' },
  { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', active: 'border-amber-500', hex: '#d97706' },
  { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', active: 'border-rose-500', hex: '#e11d48' },
  { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', active: 'border-indigo-500', hex: '#4f46e5' },
  { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', active: 'border-emerald-500', hex: '#059669' },
  { text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', active: 'border-violet-500', hex: '#7c3aed' },
];

const MindMapHierarchyItem = ({ node, level = 0, colorIndex = 0 }: { node: MindMapNode, level?: number, colorIndex?: number, key?: React.Key }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const color = PALETTE[colorIndex % PALETTE.length];

  return (
    <div className={`mt-2 ${level > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-start group">
        {hasChildren ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-2 p-1 mr-1 rounded-md transition-all ${
              level === 0 ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : level > 0 ? (
          <div className="w-6 shrink-0" />
        ) : null}
        
        <div className={`flex-1 p-3 rounded-xl border transition-all duration-300 ${
          level === 0 
          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black text-sm' 
          : level === 1 
          ? `${color.bg} ${color.border} ${color.text} font-bold text-xs shadow-sm` 
          : `bg-white ${color.border} border-l-4 text-slate-700 text-[11px] leading-relaxed shadow-sm`
        }`}>
          {node.text}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className={`ml-3 mt-1 border-l-2 pl-3 space-y-2 transition-all duration-500 overflow-hidden ${
          level === 0 ? 'border-blue-100' : color.border
        }`}>
          {node.children!.map((child, i) => (
            <MindMapHierarchyItem 
              key={i} 
              node={child} 
              level={level + 1} 
              colorIndex={level === 0 ? i : colorIndex} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MindMapTreeView = ({ data }: { data: MindMapNode }) => {
  const [scale, setScale] = useState(0.85);
  const [translate, setTranslate] = useState({ x: 80, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const containerRef = useRef<SVGSVGElement>(null);

  const nodeWidth = 160;
  const nodeHeight = 44;
  const horizontalGap = 240;
  const minVerticalGap = 60;

  const getSubtreeHeight = (node: MindMapNode): number => {
    if (collapsedNodes.has(node.text) || !node.children || node.children.length === 0) {
      return minVerticalGap;
    }
    return node.children.reduce((acc, child) => acc + getSubtreeHeight(child), 0);
  };

  const centerTree = () => {
    if (!data) return;
    const totalHeight = getSubtreeHeight(data);
    const centerY = 300 - (totalHeight / 2) + (nodeHeight / 2);
    setTranslate({ x: 80, y: centerY });
    setScale(0.85);
  };

  useEffect(() => {
    centerTree();
  }, [data]);

  const toggleNode = (nodeText: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeText)) next.delete(nodeText);
      else next.add(nodeText);
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const target = e.target as Element;
    if (target.closest('.node-group')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const renderTree = (node: MindMapNode, level: number = 0, yRangeStart: number = 0, parentX: number = 0, parentY: number = 0, colorIdx: number = 0) => {
    const subtreeHeight = getSubtreeHeight(node);
    const x = level * horizontalGap;
    const y = yRangeStart + subtreeHeight / 2 - nodeHeight / 2;
    const isCollapsed = collapsedNodes.has(node.text);
    const hasChildren = node.children && node.children.length > 0;
    const color = PALETTE[colorIdx % PALETTE.length];
    const elements = [];

    if (level > 0) {
      elements.push(
        <path
          key={`path-${node.text}-${level}`}
          d={`M ${parentX + nodeWidth} ${parentY + nodeHeight / 2} 
             C ${parentX + nodeWidth + 80} ${parentY + nodeHeight / 2}, 
               ${x - 80} ${y + nodeHeight / 2}, 
               ${x} ${y + nodeHeight / 2}`}
          stroke={color.hex}
          strokeWidth={level === 1 ? 2.5 : 1.5}
          fill="none"
          opacity={0.5}
          className="transition-all duration-300"
        />
      );
    }

    elements.push(
      <g key={`node-${node.text}-${level}`} className="node-group">
        <rect
          x={x}
          y={y}
          width={nodeWidth}
          height={nodeHeight}
          rx={12}
          fill={level === 0 ? '#1e293b' : level === 1 ? color.hex : 'white'}
          stroke={level === 0 ? '#1e293b' : color.hex}
          strokeWidth={2}
          className="shadow-sm transition-all duration-300"
        />
        <foreignObject x={x + 10} y={y + 5} width={nodeWidth - 20} height={nodeHeight - 10} className="pointer-events-none">
          <div className={`w-full h-full flex items-center justify-center text-center overflow-hidden leading-tight ${
            level === 0 ? 'text-white font-black text-[11px]' : level === 1 ? `text-white font-bold text-[10px]` : `${color.text} font-semibold text-[10px]`
          }`}>
            {node.text}
          </div>
        </foreignObject>
        {hasChildren && (
          <g 
            transform={`translate(${x + nodeWidth}, ${y + nodeHeight / 2})`}
            onClick={(e) => { e.stopPropagation(); toggleNode(node.text); }}
            className="cursor-pointer group"
          >
            <circle r="8" fill="white" stroke={color.hex} strokeWidth="1.5" className="group-hover:fill-slate-50 transition-colors" />
            <text y="3.5" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color.hex} className="pointer-events-none select-none">{isCollapsed ? '+' : '-'}</text>
          </g>
        )}
      </g>
    );

    if (!isCollapsed && node.children) {
      let currentYStart = yRangeStart;
      node.children.forEach((child, i) => {
        const childElements = renderTree(child, level + 1, currentYStart, x, y, level === 0 ? i : colorIdx);
        elements.push(...childElements);
        currentYStart += getSubtreeHeight(child);
      });
    }
    return elements;
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden select-none shadow-inner">
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <button onClick={() => setScale(s => Math.min(s + 0.1, 2.5))} className="p-2 bg-white rounded-lg shadow-md border hover:bg-slate-50 text-slate-600 transition-colors" title="Zoom In"><ZoomIn size={16} /></button>
        <button onClick={() => setScale(s => Math.max(s - 0.1, 0.2))} className="p-2 bg-white rounded-lg shadow-md border hover:bg-slate-50 text-slate-600 transition-colors" title="Zoom Out"><ZoomOut size={16} /></button>
        <button onClick={centerTree} className="p-2 bg-white rounded-lg shadow-md border hover:bg-slate-50 text-slate-600 transition-colors" title="Reset View & Focus"><RefreshCw size={16} /></button>
      </div>
      <div className="absolute bottom-4 left-4 z-10 text-[9px] font-black uppercase text-slate-400 tracking-widest bg-white/50 px-2 py-1 rounded">Drag Space to Pan • Scroll to Zoom</div>
      <svg
        ref={containerRef}
        className="w-full h-full cursor-move touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={(e) => {
          const zoomSpeed = 0.001;
          setScale(s => Math.min(Math.max(s - e.deltaY * zoomSpeed, 0.2), 2.5));
        }}
      >
        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>{renderTree(data)}</g>
      </svg>
    </div>
  );
};

export default function DocumentParser() {
  // Sidebar and Navigation
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFeature, setActiveFeature] = useState('home');
  const [activeTab, setActiveTab] = useState('parse');
  const [parseFormat, setParseFormat] = useState('segments');
  
  // Resizing State for Vertical Split Bar
  const [rightPanelWidth, setRightPanelWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  
  // Translation Output Language State
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'en',
    selectedModelId: 'gemini-3-flash-preview',
    modelApiKeys: {}
  });

  const t = (key: string) => {
    const parts = key.split('.');
    let result = TRANSLATIONS[settings.language] || TRANSLATIONS.en;
    for (const part of parts) {
      result = result?.[part];
    }
    return result || key;
  };

  // User Profile
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@enterprise.com',
    avatar: 'JD',
    companyName: 'DocuCorp Solutions',
    jobTitle: 'Senior Systems Architect',
    address: '123 Innovation Drive, Silicon Valley, CA 94025'
  });

  // Credit System
  const [totalCredits, setTotalCredits] = useState(12450);

  // History & Sessions
  const [sessions, setSessions] = useState<FileSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  
  // File State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [fileMimeType, setFileMimeType] = useState<string>('image/png');
  const [isRenderingPdf, setIsRenderingPdf] = useState(false);
  const [renderProgress, setRenderProgress] = useState({ current: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [imageDimensions, setImageDimensions] = useState<Record<number, { width: number; height: number }>>({});
  
  // Parsing State
  const [isParsing, setIsParsing] = useState(false);
  const [parsedSegments, setParsedSegments] = useState<Segment[]>([]);
  const [parsedMarkdown, setParsedMarkdown] = useState('');
  const [parsedJSON, setParsedJSON] = useState<any>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  // Translation States (per session)
  const [translatedSegments, setTranslatedSegments] = useState<Segment[]>([]);
  const [translatedMarkdown, setTranslatedMarkdown] = useState('');
  const [translatedJSON, setTranslatedJSON] = useState<any>(null);
  const [translatedExtractionResult, setTranslatedExtractionResult] = useState<ExtractionResult | null>(null);
  
  // Fields Extract State
  const [fieldSuggestions, setFieldSuggestions] = useState<FieldSuggestion[]>([]);
  const [isSuggestingFields, setIsSuggestingFields] = useState(false);
  const [isExtractingFields, setIsExtractingFields] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldDesc, setCustomFieldDesc] = useState('');
  const [hoveredMetadataKey, setHoveredMetadataKey] = useState<string | null>(null);

  // Split Logic State
  const [splitConfigs, setSplitConfigs] = useState<SplitTypeConfig[]>([]);
  const [newSplitType, setNewSplitType] = useState('');
  const [newIdentifierKey, setNewIdentifierKey] = useState('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [isSuggestingSplits, setIsSuggestingSplits] = useState(false);
  const [splitExtractionResult, setSplitExtractionResult] = useState<SplitExtractionResult | null>(null);
  const [selectedSplitKey, setSelectedSplitKey] = useState<string | null>(null);
  const [showSplitInfo, setShowSplitInfo] = useState(false);

  // MindMap State
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [mindMapViewMode, setMindMapViewMode] = useState<'hierarchy' | 'tree'>('hierarchy');

  // Validation State
  const [validationExcelData, setValidationExcelData] = useState<any>(null); // Full rows array or single row
  const [validationExcelRows, setValidationExcelRows] = useState<any[]>([]); 
  const [validationExcelName, setValidationExcelName] = useState<string>('');
  const [isExcelUploadExpanded, setIsExcelUploadExpanded] = useState(true);
  const [validationMode, setValidationMode] = useState<'Exact' | 'Semantic' | 'Table'>('Exact');
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [tableValidationResults, setTableValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonTemplateInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Settings & View State
  const [zoomLevel, setZoomLevel] = useState(100);
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([
    { id: 1, key: 'dv_live_49f8...29a', created: '2024-05-10', lastUsed: '2 hours ago' }
  ]);
  const [keyTab, setKeyTab] = useState('general');
  const [dateRangePreset, setDateRangePreset] = useState('Last 30 Days');
  const [startDate, setStartDate] = useState('2024-09-01');
  const [endDate, setEndDate] = useState('2024-10-01');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const imageRefs = useRef<Record<number, HTMLImageElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if ((window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }, []);

  // Effect to handle translation automatically when data or language changes
  useEffect(() => {
    const handleTranslation = async () => {
      if (outputLanguage === 'en' || (!parsedMarkdown && !extractionResult)) {
        setTranslatedSegments([]);
        setTranslatedMarkdown('');
        setTranslatedJSON(null);
        setTranslatedExtractionResult(null);
        return;
      }

      const session = sessions.find(s => s.id === activeSessionId);
      
      // If language changed, clear old translations for this session in local state
      // but only if we are moving to a state where re-translation is required.
      if (session && session.outputLanguage !== outputLanguage) {
          setTranslatedSegments([]);
          setTranslatedMarkdown('');
          setTranslatedExtractionResult(null);
          // Let it proceed to translate the current data for the new language
      }

      // Check specifically what needs translation
      const needsMarkdownTranslation = parsedMarkdown && (!translatedMarkdown || (session?.outputLanguage !== outputLanguage));
      const needsExtractionTranslation = extractionResult && (!translatedExtractionResult || (session?.outputLanguage !== outputLanguage));

      if (!needsMarkdownTranslation && !needsExtractionTranslation) {
        // If we have translations for the correct language, ensure local state is synced
        if (session && session.outputLanguage === outputLanguage) {
          if (session.translatedMarkdown && !translatedMarkdown) setTranslatedMarkdown(session.translatedMarkdown);
          if (session.translatedSegments && (!translatedSegments || !translatedSegments.length)) setTranslatedSegments(session.translatedSegments);
          if (session.translatedExtractionResult && !translatedExtractionResult) setTranslatedExtractionResult(session.translatedExtractionResult);
        }
        return;
      }

      setIsTranslating(true);
      const geminiConfig = {
        model: settings.selectedModelId,
        apiKey: settings.modelApiKeys[settings.selectedModelId]
      };

      try {
        const langName = TRANSLATIONS[outputLanguage]?.language || "the selected language";
        
        // Prepare ONLY the missing data to save tokens and time
        const dataToTranslate: any = {};
        if (needsMarkdownTranslation) {
          dataToTranslate.segments = parsedSegments;
          dataToTranslate.markdown = parsedMarkdown;
        }
        if (needsExtractionTranslation) {
          dataToTranslate.extractionResult = extractionResult;
        }

        const result = await translateResults(dataToTranslate, langName, geminiConfig);

        if (result) {
          // Merge with existing translations if language hasn't changed
          const newTranslatedMarkdown = result.markdown || translatedMarkdown;
          const newTranslatedSegments = result.segments || translatedSegments;
          const newTranslatedExtractionResult = result.extractionResult || translatedExtractionResult;

          setTranslatedMarkdown(newTranslatedMarkdown);
          setTranslatedSegments(newTranslatedSegments);
          setTranslatedExtractionResult(newTranslatedExtractionResult);
          
          // Update session with merged translations
          setSessions(prev => prev.map(s => s.id === activeSessionId ? {
            ...s,
            translatedSegments: newTranslatedSegments,
            translatedMarkdown: newTranslatedMarkdown,
            translatedExtractionResult: newTranslatedExtractionResult,
            outputLanguage: outputLanguage
          } : s));
        }
      } catch (err) {
        console.error("Translation failed:", err);
      } finally {
        setIsTranslating(false);
      }
    };

    handleTranslation();
  }, [outputLanguage, parsedSegments, parsedMarkdown, extractionResult, activeSessionId, settings.selectedModelId]);

  // Vertical Resizing Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth * 0.7) {
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; 
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const scrollPos = scrollContainerRef.current.scrollTop + scrollContainerRef.current.clientHeight / 2;
      let bestPage = 1;
      let minDiff = Infinity;
      Object.entries(pageRefs.current).forEach(([pageNum, el]) => {
        const div = el as HTMLDivElement;
        if (div) {
          const diff = Math.abs(div.offsetTop + div.clientHeight / 2 - scrollPos);
          if (diff < minDiff) {
            minDiff = diff;
            bestPage = parseInt(pageNum);
          }
        }
      });
      if (bestPage !== currentPage) {
        setCurrentPage(bestPage);
      }
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [filePreviews, currentPage]);

  useEffect(() => {
    if (activeSessionId) {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        segments: parsedSegments,
        markdown: parsedMarkdown,
        json: parsedJSON,
        chatMessages,
        extractionResult,
        splitExtractionResult,
        fieldSuggestions,
        splitConfigs,
        mindMapData,
        translatedSegments,
        translatedMarkdown,
        translatedJSON,
        translatedExtractionResult,
        outputLanguage
      } : s));
    }
  }, [parsedSegments, parsedMarkdown, parsedJSON, chatMessages, extractionResult, splitExtractionResult, fieldSuggestions, splitConfigs, mindMapData, translatedSegments, translatedMarkdown, translatedJSON, translatedExtractionResult, outputLanguage]);

  const normalizeMimeType = (mime: string, fileName?: string) => {
    if (mime) {
       const m = mime.toLowerCase();
       if (m.includes('jpg') || m.includes('jpeg')) return 'image/jpeg';
       if (m.includes('png')) return 'image/png';
       if (m.includes('webp')) return 'image/webp';
       if (m.includes('pdf')) return 'application/pdf';
       return m;
    }
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext === 'png') return 'image/png';
      if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
      if (ext === 'webp') return 'image/webp';
      if (ext === 'pdf') return 'application/pdf';
    }
    return 'image/png';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsParsing(true);
      const sessionId = Date.now();
      const normalizedMime = normalizeMimeType(file.type, file.name);
      const newSession: FileSession = {
        id: sessionId,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        date: new Date().toLocaleTimeString(),
        previews: [],
        mimeType: normalizedMime,
        segments: [],
        markdown: '',
        json: null,
        chatMessages: [],
        extractionResult: null,
        splitExtractionResult: null,
        fieldSuggestions: [],
        splitConfigs: [],
        mindMapData: null,
        translatedSegments: [],
        translatedMarkdown: '',
        translatedJSON: null,
        translatedExtractionResult: null,
        outputLanguage: 'en'
      };
      setUploadedFile(file);
      const finalizeSession = (previews: string[], mime: string) => {
        const finalMime = normalizeMimeType(mime, file.name);
        newSession.previews = previews;
        newSession.mimeType = finalMime;
        setFilePreviews(previews);
        setFileMimeType(finalMime);
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(sessionId);
        setActiveFeature('home');
        setCurrentPage(1);
        setImageDimensions({});
        resetCurrentView();
        setIsParsing(false);
      };
      if (normalizedMime === 'application/pdf') {
        setIsRenderingPdf(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const pdfjs = (window as any).pdfjsLib;
            if (!pdfjs) throw new Error('PDF.js not loaded');
            const typedArray = new Uint8Array(reader.result as ArrayBuffer);
            const loadingTask = pdfjs.getDocument(typedArray);
            const pdf = await loadingTask.promise;
            const previews: string[] = [];
            setRenderProgress({ current: 0, total: pdf.numPages });
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 2.0 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (!context) continue;
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              await page.render({ canvasContext: context, viewport }).promise;
              previews.push(canvas.toDataURL('image/png'));
              setRenderProgress(prev => ({ ...prev, current: i }));
            }
            finalizeSession(previews, 'image/png');
            setIsRenderingPdf(false);
          } catch (error) {
            console.error('Error rendering PDF:', error);
            alert('Error rendering PDF.');
            setIsParsing(false);
            setIsRenderingPdf(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          finalizeSession([reader.result as string], normalizedMime);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValidationExcelName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length > 0) {
          setValidationExcelRows(data);
          setValidationExcelData(data[0]);
          setIsExcelUploadExpanded(false); 
          
          const hasTable = (parsedSegments || []).some(s => s.type === 'Table');
          if (hasTable) {
             setValidationMode('Table');
             runValidation(data, 'Table');
          } else {
             setValidationMode('Exact');
             runValidation(data[0], 'Exact');
          }
        } else {
          alert("Excel file is empty.");
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleJsonTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target?.result as string;
          const json = JSON.parse(content);
          let newSuggestions: FieldSuggestion[] = [];
          if (Array.isArray(json)) {
            newSuggestions = json.filter(item => typeof item === 'object' && item !== null)
                                 .map(item => ({ 
                                   key: item.key ? String(item.key) : Object.keys(item)[0], 
                                   description: item.description || `Extracted from JSON template` 
                                 }));
          } else if (typeof json === 'object' && json !== null) {
            newSuggestions = Object.keys(json).map(key => ({
              key,
              description: `Exact match for "${key}" from template`
            }));
          }
          if (newSuggestions.length > 0) {
            setFieldSuggestions(prev => [...prev, ...newSuggestions]);
          } else {
            alert("Could not find any keys to extract from this JSON.");
          }
        } catch (err) {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const runValidation = async (data: any, mode: 'Exact' | 'Semantic' | 'Table') => {
    if (!parsedJSON) {
      alert("Please analyze the document first.");
      return;
    }
    setIsValidating(true);
    setValidationResults(null);
    setTableValidationResults(null);
    
    const geminiConfig = {
      model: settings.selectedModelId,
      apiKey: settings.modelApiKeys[settings.selectedModelId]
    };

    if (mode === 'Table') {
      try {
        const tableSegments = (parsedSegments || []).filter(s => s.type === 'Table');
        const tableMarkdown = tableSegments.map(s => s.content).join('\n\n---\n\n');
        const results = await compareTableData(tableMarkdown, data, geminiConfig);
        setTableValidationResults(results);
      } catch (err) {
        console.error(err);
        alert("Table validation failed.");
      } finally {
        setIsValidating(false);
      }
      return;
    }

    if (!extractionResult) {
      alert("Please extract fields first.");
      setIsValidating(false);
      return;
    }

    const extracted = extractionResult.data;
    const matches: Record<string, boolean> = {};
    const details: Record<string, string> = {};
    let matchedCount = 0;
    
    if (mode === 'Exact') {
      const targetRow = Array.isArray(data) ? data[0] : data;
      const excelKeys = Object.keys(targetRow);
      excelKeys.forEach(key => {
        const extractedValue = String(extracted[key] || '').trim().toLowerCase();
        const excelValue = String(targetRow[key] || '').trim().toLowerCase();
        const isMatch = extractedValue === excelValue && extractedValue !== '';
        matches[key] = isMatch;
        details[key] = isMatch ? "Exact match found." : `Mismatch: Expected "${excelValue}", found "${extractedValue}"`;
        if (isMatch) matchedCount++;
      });
      setValidationResults({
        matches,
        similarity: Math.round((matchedCount / excelKeys.length) * 100),
        details
      });
      setIsValidating(false);
    } else {
      try {
        const targetRow = Array.isArray(data) ? data[0] : data;
        const result = await performSemanticValidation(extracted, targetRow, geminiConfig);
        setValidationResults(result);
      } catch (err) {
        console.error(err);
        alert("Semantic validation failed.");
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleImageLoad = (pageNum: number, img: HTMLImageElement) => {
    setImageDimensions(prev => ({
      ...prev,
      [pageNum]: { width: img.naturalWidth, height: img.naturalHeight }
    }));
  };

  const resetCurrentView = () => {
    setParsedSegments([]);
    setParsedMarkdown('');
    setParsedJSON(null);
    setChatMessages([]);
    setFieldSuggestions([]);
    setExtractionResult(null);
    setSplitExtractionResult(null);
    setSelectedSplitKey(null);
    setMindMapData(null);
    setValidationResults(null);
    setTableValidationResults(null);
    setValidationExcelData(null);
    setValidationExcelRows([]);
    setValidationExcelName('');
    setIsExcelUploadExpanded(true);
    setZoomLevel(100);
    setHoveredMetadataKey(null);
    setTranslatedSegments([]);
    setTranslatedMarkdown('');
    setTranslatedJSON(null);
    setTranslatedExtractionResult(null);
    setOutputLanguage('en');
  };

  const loadSession = (session: FileSession) => {
    setActiveSessionId(session.id);
    setFilePreviews(session.previews);
    setFileMimeType(session.mimeType);
    setParsedSegments(session.segments);
    setParsedMarkdown(session.markdown);
    setParsedJSON(session.json);
    setChatMessages(session.chatMessages);
    setExtractionResult(session.extractionResult);
    setSplitExtractionResult(session.splitExtractionResult);
    setFieldSuggestions(session.fieldSuggestions);
    setSplitConfigs(session.splitConfigs);
    setMindMapData(session.mindMapData || null);
    setTranslatedSegments(session.translatedSegments || []);
    setTranslatedMarkdown(session.translatedMarkdown || '');
    setTranslatedJSON(session.translatedJSON || null);
    setTranslatedExtractionResult(session.translatedExtractionResult || null);
    setOutputLanguage(session.outputLanguage || 'en');
    setActiveFeature('home');
    setCurrentPage(1);
    setImageDimensions({});
    setHoveredMetadataKey(null);
  };

  const parseDocument = async () => {
    if (filePreviews.length === 0) return;
    setIsParsing(true);

    const geminiConfig = {
      model: settings.selectedModelId,
      apiKey: settings.modelApiKeys[settings.selectedModelId]
    };

    try {
      const allChunks: Segment[] = [];
      let fullMarkdown = "";
      let docType = "document";
      for (let i = 0; i < filePreviews.length; i++) {
        const pageNum = i + 1;
        const previewToAnalyze = filePreviews[i];
        const base64Data = previewToAnalyze.split(',')[1];
        const currentMime = previewToAnalyze.match(/data:([^;]+);base64/)?.[1] || fileMimeType;
        const responseText = await parseDocumentWithGemini(base64Data, currentMime, 1000, 1000, geminiConfig);
        if (!responseText) continue;
        const markdownSection = responseText.match(/===\s*MARKDOWN\s*===\s*\n([\s\S]*?)(?:\n===\s*JSON\s*===|$)/i)?.[1] || "";
        const jsonSection = responseText.match(/===\s*JSON\s*===\s*\n([\s\S]*?)$/i)?.[1] || "";
        let pageJson: any = null;
        try {
          const cleanJson = jsonSection.replace(/```json\n?|```/g, '').trim();
          pageJson = JSON.parse(cleanJson);
        } catch {
          pageJson = { chunks: [] };
        }
        const segments: Segment[] = (pageJson?.chunks || []).map((chunk: any) => {
          const bb = chunk.bounding_box || [0,0,0,0];
          return {
            id: chunk.id || Math.random().toString(36).substr(2, 6),
            type: chunk.type || 'Text',
            content: chunk.content || chunk.markdown_content || '',
            bbox: [bb[0], bb[1], bb[2], bb[3]], 
            page: pageNum
          };
        });
        allChunks.push(...segments);
        fullMarkdown += (fullMarkdown ? `\n\n` : '') + `--- Page ${pageNum} ---\n\n` + markdownSection.trim();
        if (pageJson?.document_type) docType = pageJson.document_type;
      }
      setParsedSegments(allChunks);
      setParsedMarkdown(fullMarkdown);
      setParsedJSON({
        document_type: docType,
        chunks: allChunks.map(s => ({ id: s.id, type: s.type, content: s.content, bounding_box: s.bbox, page: s.page })),
        metadata: { filename: uploadedFile?.name || 'document', page_count: filePreviews.length }
      });
      setParseFormat('segments');
      setTotalCredits(prev => Math.max(0, prev - (15 * filePreviews.length)));
    } catch (error) {
      console.error('Parsing error:', error);
      alert('Analysis failed. Please verify connection.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSuggestFields = async () => {
    if (!parsedJSON) return;
    setIsSuggestingFields(true);
    const geminiConfig = {
      model: settings.selectedModelId,
      apiKey: settings.modelApiKeys[settings.selectedModelId]
    };
    try {
      const suggestions = await suggestFields(parsedJSON, geminiConfig);
      setFieldSuggestions(suggestions);
    } catch (error) {
      console.error(error);
      alert("Field suggestion error.");
    } finally {
      setIsSuggestingFields(false);
    }
  };

  const handleSuggestSplits = async () => {
    if (!parsedJSON) return;
    setIsSuggestingSplits(true);
    const geminiConfig = {
      model: settings.selectedModelId,
      apiKey: settings.modelApiKeys[settings.selectedModelId]
    };
    try {
      const suggestions = await suggestSplitConfigs(parsedJSON, geminiConfig);
      setSplitConfigs((suggestions || []).map((s: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: s.name,
        identifierKey: s.identifierKey
      })));
    } catch (error) {
      console.error(error);
      alert("Split suggestion error.");
    } finally {
      setIsSuggestingSplits(false);
    }
  };

  const handleExtractFields = async () => {
    if (!parsedJSON || fieldSuggestions.length === 0 || filePreviews.length === 0) return;
    setIsExtractingFields(true);
    const geminiConfig = {
      model: settings.selectedModelId,
      apiKey: settings.modelApiKeys[settings.selectedModelId]
    };
    try {
      const previewToAnalyze = filePreviews[currentPage - 1];
      const base64Data = previewToAnalyze.split(',')[1];
      const currentMime = previewToAnalyze.match(/data:([^;]+);base64/)?.[1] || fileMimeType;
      const result = await extractFields(parsedJSON, fieldSuggestions, base64Data, currentMime, geminiConfig);
      setExtractionResult(result);
    } catch (error) {
      console.error(error);
      alert("Extraction error.");
    } finally {
      setIsExtractingFields(false);
    }
  };

  const handlePerformSplit = async () => {
    if (!parsedJSON || splitConfigs.length === 0) return;
    setIsSplitting(true);
    const geminiConfig = {
      model: settings.selectedModelId,
      apiKey: settings.modelApiKeys[settings.selectedModelId]
    };
    try {
      const result = await performDocumentSplit(parsedJSON, splitConfigs, geminiConfig);
      setSplitExtractionResult(result);
      const firstKey = result.data ? Object.keys(result.data)[0] : null;
      if (firstKey) setSelectedSplitKey(firstKey);
    } catch (error) {
      console.error(error);
      alert("Document split error.");
    } finally {
      setIsSplitting(false);
    }
  };

  const handleGenerateMindMap = async () => {
    if (!parsedMarkdown) {
      alert("Please analyze the document first.");
      return;
    }
    setIsGeneratingMindMap(true);
    const geminiConfig = {
      model: settings.selectedModelId,
      apiKey: settings.modelApiKeys[settings.selectedModelId]
    };
    try {
      const result = await generateMindMap(parsedMarkdown, geminiConfig);
      setMindMapData(result);
      setTotalCredits(prev => Math.max(0, prev - 10));
    } catch (error) {
      console.error(error);
      alert("MindMap generation error.");
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || filePreviews.length === 0) return;
    const userMsg: ChatMessage = { id: Date.now(), type: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    const geminiConfig = {
      model: settings.selectedModelId,
      apiKey: settings.modelApiKeys[settings.selectedModelId]
    };
    try {
      const previewToAnalyze = filePreviews[currentPage - 1];
      const base64Data = previewToAnalyze.split(',')[1];
      const currentMime = previewToAnalyze.match(/data:([^;]+);base64/)?.[1] || fileMimeType;
      const aiResponse = await chatWithDocument(userMsg.content, base64Data, currentMime, [], geminiConfig);
      const botMsg: ChatMessage = { id: Date.now() + 1, type: 'assistant', content: aiResponse || "I couldn't process that query." };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { id: Date.now(), type: 'assistant', content: "AI service error." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const scrollToSegment = (id: any) => {
    const firstMatch = parsedSegments.find(s => String(s.id) === String(id));
    if (firstMatch && firstMatch.bbox && scrollContainerRef.current) {
        const segPage = firstMatch.page || 1;
        const pageEl = pageRefs.current[segPage];
        if (pageEl && scrollContainerRef.current) {
            const [, y1] = firstMatch.bbox; 
            const container = scrollContainerRef.current;
            const img = imageRefs.current[segPage];
            if (img) {
                const scrollY = pageEl.offsetTop + (y1 / 1000) * img.clientHeight - (container.clientHeight / 2);
                container.scrollTo({ top: scrollY, behavior: 'smooth' });
                setCurrentPage(segPage);
            }
        }
    }
  };

  const jumpToPage = (pageNum: number) => {
    const el = pageRefs.current[pageNum];
    if (el && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
      setCurrentPage(pageNum);
    }
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now(),
      key: `dv_live_${Math.random().toString(36).substr(2, 12)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    setApiKeys(prev => [newKey, ...prev]);
  };

  const deleteApiKey = (id: number) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className={`flex items-center space-x-2 font-bold text-lg mb-4 ${settings.theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
      <Icon className="w-5 h-5 text-blue-600" />
      <span>{title}</span>
    </div>
  );

  const getActiveChunkIds = () => {
    if (hoveredMetadataKey && (extractionResult?.metadata || translatedExtractionResult?.metadata)) {
      const metaSource = extractionResult?.metadata || translatedExtractionResult?.metadata;
      const metadata = metaSource as Record<string, { references: string[] }>;
      const refs = metadata[hoveredMetadataKey]?.references;
      if (refs) return new Set(refs.map(String));
    }
    if (selectedSplitKey && splitExtractionResult?.metadata) {
      const metadata = splitExtractionResult.metadata as Record<string, { references: string[] }>;
      const entry = metadata[selectedSplitKey];
      return entry ? new Set(entry.references.map(String)) : null;
    }
    return null;
  };

  const getValidationColorForSegment = (segId: any) => {
    if (activeTab !== 'validation' || !validationResults || !extractionResult) return null;
    for (const [fieldName, meta] of Object.entries(extractionResult.metadata)) {
      const metadataEntry = meta as { references: string[] };
      if (metadataEntry.references && metadataEntry.references.map(String).includes(String(segId))) {
        if (validationResults.matches.hasOwnProperty(fieldName)) {
          return validationResults.matches[fieldName] ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
        }
      }
    }
    return null;
  };

  const isMetadataActive = (segId: any) => {
    const activeChunkIds = getActiveChunkIds();
    return activeChunkIds ? activeChunkIds.has(String(segId)) : false;
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= filePreviews.length) {
      jumpToPage(val);
    }
  };

  const handleMetadataHover = (key: string | null) => {
    setHoveredMetadataKey(key);
    if (key && (extractionResult?.metadata || translatedExtractionResult?.metadata)) {
      const metaSource = extractionResult?.metadata || translatedExtractionResult?.metadata;
      const metadata = metaSource as Record<string, { references: string[] }>;
      const entry = metadata[key];
      const refs = entry?.references;
      if (refs && refs.length > 0) {
        scrollToSegment(refs[0]);
      }
    } else if (key && splitExtractionResult?.metadata) {
      const metadata = splitExtractionResult.metadata as Record<string, { references: string[] }>;
      const splitEntry = metadata[key];
      const splitRefs = splitEntry?.references;
      if (splitRefs && splitRefs.length > 0) {
        scrollToSegment(splitRefs[0]);
      }
    }
  };

  const maskApiKey = (key?: string) => {
    if (!key) return "";
    if (key.length <= 12) return "********";
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  const isDarkMode = settings.theme === 'dark';

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.webp" />
      <input ref={avatarInputRef} type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
      <input ref={excelInputRef} type="file" className="hidden" onChange={handleExcelUpload} accept=".xlsx,.csv" />
      <input ref={jsonTemplateInputRef} type="file" className="hidden" onChange={handleJsonTemplateUpload} accept=".json" />

      <div className={`border-r transition-all duration-300 flex flex-col shadow-sm z-30 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className={`p-5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          {sidebarOpen && <h1 className="font-black text-xl tracking-tight text-blue-600">POC-OCR</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
            {sidebarOpen ? <X size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {[
            { id: 'home', icon: HomeIcon, label: t('home') },
            { id: 'upload', icon: Upload, label: t('newUpload'), isAction: true },
            { id: 'history', icon: FileText, label: t('history') },
            { id: 'key', icon: Settings, label: t('settings') },
            { id: 'document', icon: BookOpen, label: t('docs'), isExternal: true }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.isAction) {
                  fileInputRef.current?.click();
                  return;
                }
                if (item.isExternal) {
                  window.open('https://ai.google.dev/gemini-api/docs', '_blank');
                  return;
                }
                setActiveFeature(item.id);
                setSidebarOpen(true);
              }}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${
                activeFeature === item.id 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon size={20} className={sidebarOpen ? "mr-3" : "mx-auto"} />
              {sidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
              {sidebarOpen && item.isExternal && <ExternalLink size={12} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button onClick={() => { setActiveFeature('key'); setKeyTab('general'); setSidebarOpen(true); }} className={`w-full flex items-center p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} ${activeFeature === 'key' && keyTab === 'general' ? (isDarkMode ? 'bg-slate-800 ring-1 ring-blue-900' : 'bg-slate-100 ring-1 ring-blue-200') : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white overflow-hidden">
              {profile.avatar.length > 2 ? <img src={profile.avatar} className="w-full h-full object-cover" /> : profile.avatar}
            </div>
            {sidebarOpen && (
              <div className="ml-3 text-left overflow-hidden">
                <p className="text-sm font-bold truncate">{profile.name}</p>
                <p className={`text-xs truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('premiumPlan')}</p>
              </div>
            )}
            {sidebarOpen && <ChevronDown size={16} className={`ml-auto ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />}
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeFeature === 'history' && (
          <div className={`absolute inset-0 z-20 flex flex-col p-10 overflow-y-auto ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto w-full">
              <SectionHeader title={t('history')} icon={FileText} />
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className={`text-center py-20 rounded-3xl border-2 border-dashed opacity-60 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <p className="font-bold">No sessions logged.</p>
                  </div>
                ) : (
                  sessions.map(session => (
                    <button key={session.id} onClick={() => loadSession(session)} className={`w-full text-left flex items-center p-4 border rounded-2xl transition-all hover:shadow-md ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-900' : 'bg-white border-slate-100 hover:border-blue-200'} ${activeSessionId === session.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mr-4"><FileText size={24} /></div>
                      <div className="flex-1 min-w-0"><p className="font-bold truncate">{session.name}</p><p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{session.date} • {session.size}</p></div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'home' && (
          <>
            <header className={`border-b px-6 py-4 flex items-center justify-between shadow-sm z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center space-x-3"><div className="bg-blue-50 p-2 rounded-lg"><FileText className="text-blue-600" size={20} /></div><div><h2 className="text-sm font-bold">{t('activeSession')}</h2><p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : t('noFile')}</p></div></div>
              
              <div className="flex items-center space-x-6">
                {/* Result Translation Combo Box */}
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border dark:border-slate-700 shadow-sm">
                  <Languages size={16} className="text-blue-500" />
                  <select 
                    value={outputLanguage} 
                    onChange={(e) => setOutputLanguage(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-black uppercase outline-none cursor-pointer focus:ring-0 text-slate-600 dark:text-slate-300"
                  >
                    <option value="en">Original (EN)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="de">Deutsch (DE)</option>
                    <option value="ja">日本語 (JP)</option>
                    <option value="ko">한국어 (KR)</option>
                    <option value="vi">Tiếng Việt (VN)</option>
                    <option value="zh">简体中文 (CN)</option>
                  </select>
                </div>

                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-black uppercase tracking-wider border border-blue-100 flex items-center shadow-sm">
                  <Zap size={14} className="mr-2 fill-blue-600 text-blue-600" />
                  <span>{totalCredits.toLocaleString()} {t('credits')}</span>
                </div>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <section className={`flex-1 flex flex-col overflow-hidden relative ${isDarkMode ? 'bg-slate-950' : 'bg-slate-200'}`}>
                {filePreviews.length > 0 ? (
                  <>
                    <div className={`backdrop-blur border-b px-6 py-2 flex items-center justify-between z-10 shadow-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-300'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center rounded-lg p-1 shadow-inner border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <button onClick={() => setZoomLevel(prev => Math.max(prev - 25, 25))} className={`p-1.5 rounded-md transition-colors shadow-sm ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}><ZoomOut size={16}/></button>
                          <span className="px-3 text-xs font-bold min-w-[50px] text-center">{zoomLevel}%</span>
                          <button onClick={() => setZoomLevel(prev => Math.min(prev + 400, 400))} className={`p-1.5 rounded-md transition-colors shadow-sm ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}><ZoomIn size={16}/></button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center rounded-lg p-1 shadow-inner border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                           <button onClick={() => jumpToPage(Math.max(1, currentPage - 1))} className={`p-1 rounded-lg transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronLeft size={16}/></button>
                           <div className="flex items-center px-2 space-x-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Page</span>
                              <input 
                                type="number" 
                                value={currentPage} 
                                onChange={handlePageInput}
                                className={`w-12 text-center rounded-md text-xs font-black p-0.5 focus:ring-1 focus:ring-blue-500 outline-none border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                              />
                              <span className="text-[10px] font-bold text-slate-400">/ {filePreviews.length}</span>
                           </div>
                           <button onClick={() => jumpToPage(Math.min(filePreviews.length, currentPage + 1))} className={`p-1 rounded-lg transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronRight size={16}/></button>
                        </div>
                        <button onClick={parseDocument} disabled={isParsing} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center shadow-lg ${isParsing ? 'bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}>
                          {isParsing ? <Loader2 className="animate-spin mr-2" size={14}/> : <Layers size={14} className="mr-2" />}
                          {t('analyze')}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                      <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto p-12 space-y-24 flex flex-col items-center scroll-smooth scrollbar-hide">
                        {filePreviews.map((preview, idx) => {
                          const pageNum = idx + 1;
                          return (
                            <div key={idx} ref={el => { pageRefs.current[pageNum] = el; }} data-page={pageNum} className={`relative shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 origin-top flex-shrink-0 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`} style={{ width: `${zoomLevel}%`, minWidth: '400px' }}>
                              <img ref={el => { imageRefs.current[pageNum] = el; }} src={preview} className="w-full h-auto block select-none" alt={`Page ${pageNum}`} onLoad={(e) => handleImageLoad(pageNum, e.currentTarget)} />
                              <div className={`absolute -top-10 left-0 text-[11px] font-black uppercase tracking-widest backdrop-blur px-3 py-1 rounded-full border ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-500'}`}>Page {pageNum}</div>
                              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                                {parsedSegments.filter(s => s.page === pageNum).map(seg => {
                                  if (!seg.bbox) return null;
                                  const [x1, y1, x2, y2] = seg.bbox;
                                  const isSegmentHovered = hoveredSegment === seg.id;
                                  const activeChunkIds = getActiveChunkIds();
                                  const isMetadataMatch = isMetadataActive(seg.id);
                                  const isDimmed = activeChunkIds && !activeChunkIds.has(String(seg.id));
                                  const valColor = getValidationColorForSegment(seg.id);
                                  return (
                                    <g key={seg.id} className={`cursor-pointer pointer-events-auto transition-opacity duration-300 ${isDimmed ? 'opacity-10' : 'opacity-100'}`} onMouseEnter={() => setHoveredSegment(seg.id)} onMouseLeave={() => setHoveredSegment(null)}>
                                      <rect x={x1} y={y1} width={Math.max(x2 - x1, 4)} height={Math.max(y2 - y1, 4)} fill={valColor || (isMetadataMatch ? 'rgba(37, 99, 235, 0.4)' : isSegmentHovered ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.05)')} stroke={valColor ? (valColor.includes('34') ? '#22c55e' : '#ef4444') : (isMetadataMatch ? '#2563eb' : isSegmentHovered ? '#2563eb' : 'rgba(37, 99, 235, 0.4)')} strokeWidth={valColor ? '5' : (isMetadataMatch ? '4' : isSegmentHovered ? '3' : '1.5')} vectorEffect="non-scaling-stroke" className="transition-all duration-150" />
                                      {(isSegmentHovered || isMetadataMatch) && (
                                        <g transform={`translate(${x1}, ${y1 > 40 ? y1 - 25 : y1 + 5})`}>
                                          <rect width={80} height={20} fill="#2563eb" rx={4}/>
                                          <text x={6} y={14} fill="white" fontSize={11} fontWeight="bold" fontFamily="sans-serif">{seg.type}</text>
                                        </g>
                                      )}
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                    <div onClick={() => fileInputRef.current?.click()} className={`w-32 h-32 rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 cursor-pointer hover:scale-105 transition-transform hover:shadow-2xl group border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                       <Upload size={48} className="text-blue-500 group-hover:animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">{t('ready')}</h3>
                    <p className={`max-w-sm mb-8 italic leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('landingDesc')}</p>
                    <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">{t('choose')}</button>
                  </div>
                )}
              </section>

              <div 
                className={`w-1.5 cursor-col-resize z-30 transition-all duration-150 hover:bg-blue-400 active:bg-blue-600 group relative ${isResizing ? 'bg-blue-600' : isDarkMode ? 'bg-slate-800' : 'bg-slate-300'}`}
                onMouseDown={() => setIsResizing(true)}
              >
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-10 border rounded-full shadow-sm flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <GripVertical size={12} className="text-slate-400" />
                </div>
              </div>

              <aside 
                className={`flex flex-col shadow-xl z-20 border-l ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                style={{ width: `${rightPanelWidth}px`, minWidth: '300px' }}
              >
                <div className={`flex border-b p-1 gap-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  {[
                    { id: 'parse', label: t('extract'), icon: Layers },
                    { id: 'fields', label: t('fields'), icon: Database },
                    { id: 'chat', label: t('assistant'), icon: MessageCircle },
                    { id: 'split', label: t('split'), icon: Scissors },
                    { id: 'mindmap', label: t('mindmap'), icon: Network },
                    { id: 'validation', label: t('validation'), icon: CheckCircle }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-0 flex items-center justify-center py-2 px-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : isDarkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <tab.icon size={12} className="mr-1 shrink-0" /><span className="truncate">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'parse' && (
                    <div className="p-5 flex flex-col h-full">
                      <div className={`flex p-1 rounded-xl mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        {['segments', 'markdown', 'json'].map(fmt => (
                          <button key={fmt} onClick={() => setParseFormat(fmt)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${parseFormat === fmt ? 'bg-white text-blue-600 shadow-sm' : isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}>{fmt}</button>
                        ))}
                      </div>
                      
                      <div className="flex-1 space-y-8 pb-20">
                        {/* Original Section */}
                        <div className="space-y-4">
                          {outputLanguage !== 'en' && (
                            <div className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-500 inline-block">{t('original')}</div>
                          )}
                          
                          {parseFormat === 'segments' && parsedSegments.filter(s => s.page === currentPage).map(seg => (
                            <div key={seg.id} onMouseEnter={() => setHoveredSegment(seg.id)} onMouseLeave={() => setHoveredSegment(null)} onClick={() => scrollToSegment(seg.id)} className={`group p-4 rounded-xl border transition-all cursor-pointer ${hoveredSegment === seg.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                              <div className="flex items-center justify-between mb-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${hoveredSegment === seg.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>{seg.type}</span>
                                  <span className={`text-[10px] font-mono ${hoveredSegment === seg.id ? 'text-white/60' : 'text-slate-400'}`}>#{seg.id}</span>
                              </div>
                              <div className={`text-xs leading-relaxed ${seg.type === 'Table' ? 'font-mono bg-white/10 p-2 rounded-lg border border-white/20 overflow-x-auto whitespace-pre' : 'line-clamp-3'}`}>
                                {seg.content}
                              </div>
                            </div>
                          ))}
                          {parseFormat === 'markdown' && <pre className={`p-4 border rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800'}`}>{parsedMarkdown}</pre>}
                          {parseFormat === 'json' && parsedJSON && <div className={`p-4 rounded-xl border overflow-x-auto ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800'}`}><pre className="text-[11px] font-mono text-green-400 whitespace-pre">{JSON.stringify(parsedJSON, null, 2)}</pre></div>}
                        </div>

                        {/* Translated Copy Section */}
                        {outputLanguage !== 'en' && (
                          <div className="space-y-4 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                             <div className="flex items-center justify-between">
                                <div className="px-3 py-1 bg-blue-600 rounded-lg text-[9px] font-black uppercase text-white inline-block">{t('translated')}</div>
                                {isTranslating && <Loader2 className="animate-spin text-blue-600" size={14} />}
                             </div>

                             {parseFormat === 'segments' && (translatedSegments || []).filter(s => s.page === currentPage).map(seg => (
                                <div key={`tr-${seg.id}`} onMouseEnter={() => setHoveredSegment(seg.id)} onMouseLeave={() => setHoveredSegment(null)} onClick={() => scrollToSegment(seg.id)} className={`group p-4 rounded-xl border-2 transition-all cursor-pointer ${isDarkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                                   <div className="flex items-center justify-between mb-2">
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-600 text-white">{seg.type}</span>
                                      <span className="text-[10px] font-mono text-blue-400 opacity-60">#{seg.id}</span>
                                   </div>
                                   <div className={`text-xs leading-relaxed italic ${seg.type === 'Table' ? 'font-mono bg-blue-100/20 p-2 rounded-lg border border-blue-200/20 overflow-x-auto whitespace-pre' : ''}`}>
                                      {seg.content}
                                   </div>
                                </div>
                             ))}
                             {parseFormat === 'markdown' && translatedMarkdown && (
                                <pre className={`p-4 border-2 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed italic ${isDarkMode ? 'bg-blue-900/10 border-blue-900/30 text-blue-300' : 'bg-blue-50/50 border-blue-100 text-slate-800'}`}>
                                   {translatedMarkdown}
                                </pre>
                             )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'fields' && (
                    <div className="p-6 flex flex-col h-full">
                      {!extractionResult ? (
                        <div className="flex-1 flex flex-col">
                          <button onClick={handleSuggestFields} disabled={!parsedJSON || isSuggestingFields} className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 border border-blue-200/50 mb-2">
                            {isSuggestingFields ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14} />}
                            <span>{t('suggestFields')}</span>
                          </button>
                          
                          <button onClick={() => jsonTemplateInputRef.current?.click()} className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs border mb-6 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100'}`}>
                            <Code size={14} />
                            <span>{t('uploadJson')}</span>
                          </button>

                          <div className="space-y-2 mb-6">
                            <input placeholder={t('fieldKey')} className={`w-full px-4 py-2 border rounded-lg text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} value={customFieldKey} onChange={(e) => setCustomFieldKey(e.target.value)} />
                            <div className="flex space-x-2">
                              <input placeholder={t('fieldDesc')} className={`flex-1 px-4 py-2 border rounded-lg text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} value={customFieldDesc} onChange={(e) => setCustomFieldDesc(e.target.value)} />
                              <button onClick={() => { if (customFieldKey && customFieldDesc) { setFieldSuggestions([...fieldSuggestions, { key: customFieldKey, description: customFieldDesc }]); setCustomFieldKey(''); setCustomFieldDesc(''); } }} className="bg-slate-800 text-white p-2 rounded-lg"><Plus size={16} /></button>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">{(fieldSuggestions || []).map((f, idx) => (
                            <div key={idx} className={`flex items-start justify-between p-3 border rounded-xl ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}><div className="flex-1 min-w-0"><p className="text-xs font-black truncate">{f.key}</p><p className={`text-[10px] italic truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{f.description}</p></div><button onClick={() => setFieldSuggestions(fieldSuggestions.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button></div>
                          ))}</div>
                          <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}><button onClick={handleExtractFields} disabled={fieldSuggestions.length === 0 || isExtractingFields} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">{isExtractingFields ? 'Extracting...' : t('extractFields')}</button></div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col pb-10">
                          <div className="flex items-center justify-between mb-6"><h4 className="text-sm font-black uppercase">{t('results')}</h4><button onClick={() => setExtractionResult(null)} className="text-xs font-bold text-blue-600">Reset</button></div>
                          
                          <div className="space-y-8">
                            {/* Original Results */}
                            <div className="space-y-2">
                                {outputLanguage !== 'en' && (
                                  <div className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[8px] font-black uppercase text-slate-500 inline-block">{t('original')}</div>
                                )}
                                <div className={`p-4 rounded-xl shadow-inner border overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800'}`}>
                                   <div className="font-mono text-[11px] space-y-1">
                                      <div className="text-slate-500">{"{"}</div>
                                      {Object.entries(extractionResult?.data || {}).map(([key, val], idx, arr) => (
                                        <div key={key} className={`pl-4 py-0.5 rounded transition-all ${hoveredMetadataKey === key ? 'bg-blue-900/40 ring-1 ring-blue-500/30' : ''}`} onMouseEnter={() => handleMetadataHover(key)} onMouseLeave={() => handleMetadataHover(null)}>
                                          <span className="text-blue-400">"{key}"</span>: <span className="text-amber-400">"{String(val)}"</span>{idx < arr.length - 1 ? ',' : ''}
                                        </div>
                                      ))}
                                      <div className="text-slate-500">{"}"}</div>
                                   </div>
                                </div>
                            </div>

                            {/* Translated Results */}
                            {outputLanguage !== 'en' && (
                              <div className="space-y-2 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                                 <div className="flex items-center justify-between">
                                    <div className="px-2 py-0.5 bg-blue-600 rounded text-[8px] font-black uppercase text-white inline-block">{t('translated')}</div>
                                    {isTranslating && <Loader2 className="animate-spin text-blue-600" size={12} />}
                                 </div>
                                 <div className={`p-4 rounded-xl shadow-inner border-2 overflow-hidden italic ${isDarkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="font-mono text-[11px] space-y-1">
                                       <div className="text-blue-400/50">{"{"}</div>
                                       {Object.entries(translatedExtractionResult?.data || {}).map(([key, val], idx, arr) => (
                                          <div key={`tr-data-${key}`} className={`pl-4 py-0.5 rounded transition-all ${hoveredMetadataKey === key ? 'bg-blue-400/20' : ''}`} onMouseEnter={() => handleMetadataHover(key)} onMouseLeave={() => handleMetadataHover(null)}>
                                             <span className="text-blue-400">"{key}"</span>: <span className="text-indigo-400">"{String(val)}"</span>{idx < arr.length - 1 ? ',' : ''}
                                          </div>
                                       ))}
                                       <div className="text-blue-400/50">{"}"}</div>
                                    </div>
                                 </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        {(chatMessages || []).length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-40 text-center text-xs font-black uppercase"><MessageCircle size={48} className="mb-4" />{t('assistantReady')}</div> : chatMessages.map(msg => (<div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${msg.type === 'user' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>{msg.content}</div></div>))}
                        {isChatLoading && <Loader2 className="animate-spin mx-auto text-blue-600" />}
                      </div>
                      <div className={`p-4 border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}><div className="relative"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={t('askPlaceholder')} className={`w-full pl-4 pr-12 py-3 border rounded-xl text-sm outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200'}`} /><button onClick={handleSendMessage} className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg"><Send size={16} /></button></div></div>
                    </div>
                  )}

                  {activeTab === 'split' && (
                    <div className="p-6 flex flex-col h-full">
                      <div className="mb-6 flex items-center justify-between"><div><h4 className="text-sm font-black uppercase mb-1">{t('split')}</h4><p className="text-[10px] text-slate-500 italic">{t('splitDesc')}</p></div><button onClick={() => setShowSplitInfo(!showSplitInfo)} className={`p-2 rounded-lg ${showSplitInfo ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}><Info size={18} /></button></div>
                      {!splitExtractionResult ? (
                        <div className="flex-1 flex flex-col">
                          <button onClick={handleSuggestSplits} disabled={!parsedJSON || isSuggestingFields} className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 border border-blue-200/50 mb-6">{isSuggestingFields ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}<span>{t('suggestSplits')}</span></button>
                          <div className={`p-4 rounded-2xl border mb-6 space-y-3 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}><input value={newSplitType} onChange={(e) => setNewSplitType(e.target.value)} placeholder={t('splitType')} className={`w-full px-3 py-2 border rounded-lg text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} /><input value={newIdentifierKey} onChange={(e) => setNewIdentifierKey(e.target.value)} placeholder={t('splitId')} className={`w-full px-3 py-2 border rounded-lg text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} /><button onClick={() => { if(newSplitType) { setSplitConfigs([...splitConfigs, {id: Date.now().toString(), name: newSplitType, identifierKey: newIdentifierKey}]); setNewSplitType(''); setNewIdentifierKey(''); } }} className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-black flex items-center justify-center space-x-2"><Plus size={14} /><span>{t('addRule')}</span></button></div>
                          <div className="flex-1 space-y-3">{(splitConfigs || []).map(c => (<div key={c.id} className={`flex items-center justify-between p-3 rounded-xl border group ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}><div className="flex-1 min-w-0"><p className="text-xs font-black truncate">{c.name}</p><p className="text-[9px] text-slate-400">{c.identifierKey || 'No identifier'}</p></div><button onClick={() => setSplitConfigs(splitConfigs.filter(x => x.id !== c.id))} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button></div>))}</div>
                          <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}><button onClick={handlePerformSplit} disabled={splitConfigs.length === 0 || isSplitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">{isSplitting ? 'Splitting...' : t('categorizeSplit')}</button></div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col pb-10">
                          <div className="flex items-center justify-between mb-6"><h4 className="text-sm font-black uppercase">{t('results')}</h4><button onClick={() => setSplitExtractionResult(null)} className="text-xs font-bold text-blue-600">Edit Rules</button></div>
                          <div className="flex flex-wrap gap-2 mb-6">{Object.keys(splitExtractionResult?.data || {}).map((k) => (<button key={k} onClick={() => setSelectedSplitKey(k)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${selectedSplitKey === k ? 'bg-blue-600 border-blue-600 text-white' : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>{k}</button>))}</div>
                          <div className="space-y-6">
                            <div><div className="flex justify-between items-center mb-2"><span className="text-[10px] uppercase font-black text-slate-400">data.json</span></div><div className={`p-4 rounded-xl shadow-inner border overflow-x-auto ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800'}`}><pre className="text-[11px] font-mono text-blue-400 whitespace-pre">{JSON.stringify(splitExtractionResult?.data || {}, null, 2)}</pre></div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'mindmap' && (
                    <div className="p-6 flex flex-col h-full">
                      <div className="mb-6 flex items-center justify-between"><div><h4 className="text-sm font-black uppercase mb-1">{t('mindmap')}</h4><p className="text-[10px] text-slate-500 italic">{t('mindmapDesc')}</p></div>{mindMapData && (<div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><button onClick={() => setMindMapViewMode('hierarchy')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${mindMapViewMode === 'hierarchy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Hierarchy</button><button onClick={() => setMindMapViewMode('tree')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${mindMapViewMode === 'tree' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Tree</button></div>)}</div>
                      {!mindMapData ? (<div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center"><div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600"><Network size={32} /></div><button onClick={handleGenerateMindMap} disabled={!parsedMarkdown || isGeneratingMindMap} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-black transition-all disabled:bg-slate-200">{isGeneratingMindMap ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}<span>{t('generateMindMap')}</span></button></div>) : (<div className="flex-1 flex flex-col pb-10"><div className="flex items-center justify-between mb-4"><h4 className="text-[10px] font-black uppercase text-slate-400">{mindMapViewMode === 'hierarchy' ? 'List View' : 'Tree View'}</h4><button onClick={() => setMindMapData(null)} className="text-xs font-bold text-blue-600 flex items-center"><RefreshCw size={12} className="mr-1" /> Regenerate</button></div><div className="flex-1">{mindMapViewMode === 'hierarchy' ? (<div className="space-y-4"><MindMapHierarchyItem node={mindMapData} /></div>) : (<MindMapTreeView data={mindMapData} />)}</div></div>)}
                    </div>
                  )}

                  {activeTab === 'validation' && (
                    <div className="p-6 flex flex-col h-full relative">
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-black uppercase text-slate-800 mb-1">{t('validationTitle')}</h4>
                          <p className="text-[10px] text-slate-500 italic">{t('validationDesc')}</p>
                        </div>
                        {isValidating && (
                           <div className="flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 animate-pulse">
                             <Activity size={12} className="mr-2" />
                             <span className="text-[10px] font-black uppercase">{t('comparing')}</span>
                           </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col overflow-hidden">
                        {(!validationExcelData || isExcelUploadExpanded) ? (
                          <button 
                            onClick={() => excelInputRef.current?.click()} 
                            className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3 transition-all group shadow-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-blue-900 text-slate-500 hover:text-blue-400' : 'bg-white border-slate-200 hover:bg-slate-50 hover:text-blue-500 hover:border-blue-300 text-slate-400'}`}
                          >
                            <FileSpreadsheet size={36} className="group-hover:scale-110 transition-transform mb-2 text-slate-300" />
                            <div className="text-center">
                              <span className="text-xs font-black uppercase tracking-wider block">{t('uploadRefDataset')}</span>
                              <p className="text-[10px] text-slate-400 font-medium">{t('uploadRefDesc')}</p>
                            </div>
                          </button>
                        ) : (
                          <div className={`w-full border rounded-xl p-3 flex items-center justify-between mb-4 shadow-sm group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                             <div className="flex items-center min-w-0">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600 mr-3"><FileSpreadsheet size={16} /></div>
                                <div className="min-w-0">
                                   <p className={`text-[11px] font-black truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{validationExcelName || 'Reference Loaded'}</p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{validationExcelRows.length} Records Loaded</p>
                                </div>
                             </div>
                             <button onClick={() => setIsExcelUploadExpanded(true)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all" title="Replace Source File">
                               <RefreshCw size={14} />
                             </button>
                          </div>
                        )}

                        {validationExcelData && (
                          <div className="mt-2 flex-1 flex flex-col overflow-hidden">
                            <div className={`flex items-center justify-between mb-4 p-1 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                              <button 
                                onClick={() => { setValidationMode('Table'); runValidation(validationExcelRows, 'Table'); }}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center ${validationMode === 'Table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                <TableIcon size={12} className="mr-1" /> {t('tableValidation')}
                              </button>
                              <button 
                                onClick={() => { setValidationMode('Semantic'); runValidation(validationExcelRows[0], 'Semantic'); }}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center ${validationMode === 'Semantic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                              >
                                <Sparkles size={12} className="mr-1" /> {t('fieldsReasoning')}
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pb-24 pr-1 scrollbar-thin">
                               {validationMode === 'Table' && tableValidationResults ? (
                                  <div className="space-y-4">
                                     <div className={`p-4 border rounded-2xl shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                           <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tabular Cross-Comparison</h5>
                                           <div className={`px-2 py-1 rounded-lg text-[9px] font-black ${tableValidationResults.overall_accuracy > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                              {tableValidationResults.overall_accuracy}% MATCH RATE
                                           </div>
                                        </div>
                                        <div className="space-y-3">
                                           {(tableValidationResults.comparison_rows || []).map((row: any, i: number) => (
                                              <div key={i} className={`p-3 rounded-xl border-l-4 transition-all hover:translate-x-1 ${
                                                 row.status === 'MATCH' ? 'bg-green-50/50 border-green-500' : 
                                                 row.status === 'MISMATCH' ? 'bg-red-50/50 border-red-500' : 
                                                 isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-50 border-slate-300'
                                              }`}>
                                                 <div className="flex items-center justify-between mb-1">
                                                    <p className={`text-[11px] font-black truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{row.reference_row_summary}</p>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                                                       row.status === 'MATCH' ? 'bg-green-500 text-white' : 
                                                       row.status === 'MISMATCH' ? 'bg-red-500 text-white' : 
                                                       'bg-slate-500 text-white'
                                                    }`}>
                                                       {row.status}
                                                    </span>
                                                 </div>
                                                 <p className={`text-[10px] leading-relaxed italic ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{row.details}</p>
                                                 {row.confidence_score !== undefined && (
                                                    <div className={`mt-2 h-1 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                                       <div className={`h-full bg-blue-500`} style={{ width: `${row.confidence_score}%` }} />
                                                    </div>
                                                 )}
                                              </div>
                                           ))}
                                        </div>
                                     </div>
                                  </div>
                               ) : validationResults ? (
                                  <div className="space-y-3">
                                    {Object.entries(validationExcelData).map(([key, value]) => (
                                      <div key={key} className={`flex flex-col p-3 rounded-xl border transition-all duration-300 ${
                                        validationResults.matches[key] 
                                        ? 'border-green-100 border-l-4 border-l-green-500' 
                                        : (validationResults.matches.hasOwnProperty(key)) 
                                        ? 'border-red-100 border-l-4 border-l-red-500' 
                                        : isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                                      }`}>
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-[11px] font-black truncate pr-2 tracking-tight">{key}</span>
                                          {validationResults.matches.hasOwnProperty(key) && (
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${validationResults.matches[key] ? 'bg-green-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm'}`}>
                                              {validationResults.matches[key] ? 'MATCH' : 'MISMATCH'}
                                            </span>
                                          )}
                                        </div>
                                        <p className={`text-[10px] font-mono p-2 rounded-lg border ${isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-100/50 text-slate-500'} break-words`}>{String(value)}</p>
                                        {validationResults.details[key] && (
                                          <p className={`text-[9px] mt-1.5 italic flex items-start leading-tight ${validationResults.matches[key] ? 'text-green-600/70' : 'text-red-500'}`}>
                                            <Info size={10} className="mr-1 mt-0.5 shrink-0" />
                                            {validationResults.details[key]}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                               ) : (
                                  <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-50">
                                     <Sparkles size={24} />
                                     <p className="text-[10px] font-black uppercase">Click run to start comparison</p>
                                  </div>
                               )}
                            </div>
                          </div>
                        )}
                      </div>

                      {(validationResults || tableValidationResults) && (
                        <div className={`absolute bottom-0 left-0 right-0 border-t p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                 <Activity size={12} className="text-slate-400" />
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('accuracyRating')}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <h3 className={`text-3xl font-black ${
                                   (validationResults?.similarity || tableValidationResults?.overall_accuracy || 0) > 80 ? 'text-green-600' : 
                                   (validationResults?.similarity || tableValidationResults?.overall_accuracy || 0) > 50 ? 'text-amber-500' : 'text-red-500'
                                }`}>
                                  {validationResults?.similarity || tableValidationResults?.overall_accuracy || 0}%
                                </h3>
                                <div className={`h-2 flex-1 rounded-full overflow-hidden border shadow-inner ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-100'}`}>
                                  <div className={`h-full transition-all duration-1000 ease-out ${
                                     (validationResults?.similarity || tableValidationResults?.overall_accuracy || 0) > 80 ? 'bg-green-500' : 
                                     (validationResults?.similarity || tableValidationResults?.overall_accuracy || 0) > 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`} style={{ width: `${validationResults?.similarity || tableValidationResults?.overall_accuracy || 0}%` }} />
                                </div>
                              </div>
                            </div>
                            <button onClick={() => runValidation(validationMode === 'Table' ? validationExcelRows : validationExcelRows[0], validationMode)} className="ml-4 p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 group" title="Run Comparison">
                              <RefreshCw size={20} className={`${isValidating ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}

        {activeFeature === 'key' && (
          <div className={`absolute inset-0 z-30 flex flex-col overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
            <header className={`px-10 py-6 border-b flex items-center justify-between shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center space-x-3"><div className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-800'}`}><Settings size={24} /></div><h2 className="text-xl font-black uppercase tracking-tight">{t('settings')}</h2></div>
              <button onClick={() => setActiveFeature('home')} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><X size={24} /></button>
            </header>
            <div className="flex-1 flex overflow-hidden">
               <div className={`w-64 border-r p-6 space-y-1 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                  {[
                    { id: 'general', label: t('general'), icon: UserCircle },
                    { id: 'models', label: t('models'), icon: Cpu },
                    { id: 'apikey', label: t('apiKeys'), icon: Key }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setKeyTab(tab.id)} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${keyTab === tab.id ? (isDarkMode ? 'bg-slate-800 shadow-md text-blue-400 scale-[1.02]' : 'bg-white shadow-md text-blue-600 scale-[1.02]') : 'text-slate-500 hover:bg-slate-100'}`}><tab.icon size={18} className="mr-3" />{tab.label}</button>
                  ))}
                  <div className="pt-10"><button onClick={() => alert("Logging out...")} className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"><LogOut size={18} className="mr-3" />{t('signOut')}</button></div>
               </div>
               <div className="flex-1 p-12 overflow-y-auto">
                  <div className="max-w-3xl">
                    {keyTab === 'general' && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
                         <div>
                            <SectionHeader title={t('profile')} icon={User} />
                            <div className={`flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8 p-8 rounded-[2.5rem] border shadow-sm mb-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/50'}`}>
                               <div className="relative group shrink-0">
                                  <div onClick={() => avatarInputRef.current?.click()} className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-4xl text-white font-black shadow-xl ring-4 ring-white transition-transform group-hover:scale-105 cursor-pointer overflow-hidden">
                                    {profile.avatar.length > 2 ? <img src={profile.avatar} className="w-full h-full object-cover" /> : profile.avatar}
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={24} className="mb-1" /><span className="text-[10px] font-black uppercase">Change</span></div>
                                  </div>
                               </div>
                               <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</label><input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`} /></div>
                                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</label><input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className={`w-full border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`} /></div>
                               </div>
                            </div>

                            <SectionHeader title={t('appearance')} icon={LayoutGrid} />
                            <div className={`p-8 rounded-[2.5rem] border shadow-sm space-y-8 mb-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/50'}`}>
                               <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-bold">{t('theme')}</p>
                                    <p className="text-xs text-slate-500">{t('themeDesc')}</p>
                                  </div>
                                  <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                     <button onClick={() => setSettings(s => ({...s, theme: 'light'}))} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${settings.theme === 'light' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}><Sun size={14} /><span>{t('light')}</span></button>
                                     <button onClick={() => setSettings(s => ({...s, theme: 'dark'}))} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${settings.theme === 'dark' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}><Moon size={14} /><span>{t('dark')}</span></button>
                                  </div>
                               </div>
                            </div>

                            <SectionHeader title={t('i18n')} icon={Globe} />
                            <div className={`p-8 rounded-[2.5rem] border shadow-sm space-y-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/50'}`}>
                               <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-bold">{t('language')}</p>
                                    <p className="text-xs text-slate-500">{t('langDesc')}</p>
                                  </div>
                                  <div className="relative min-w-[200px]">
                                     <select 
                                       value={settings.language} 
                                       onChange={(e) => setSettings(s => ({...s, language: e.target.value}))}
                                       className={`w-full appearance-none pl-4 pr-10 py-2.5 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}
                                     >
                                        <option value="en">English (US)</option>
                                        <option value="es">Español (ES)</option>
                                        <option value="fr">Français (FR)</option>
                                        <option value="de">Deutsch (DE)</option>
                                        <option value="ja">日本語 (JP)</option>
                                        <option value="ko">한국어 (KR)</option>
                                        <option value="vi">Tiếng Việt (VN)</option>
                                        <option value="zh">简体中文 (CN)</option>
                                     </select>
                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={14} /></div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    )}
                    {keyTab === 'models' && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div>
                            <SectionHeader title={t('modelSelection')} icon={Cpu} />
                            <p className="text-sm text-slate-500 mb-6">{t('modelDesc')}</p>
                            
                            <div className="space-y-4">
                               {AVAILABLE_MODELS.map(model => (
                                  <div 
                                    key={model.id} 
                                    onClick={() => setSettings(s => ({...s, selectedModelId: model.id}))}
                                    className={`p-6 border rounded-3xl transition-all cursor-pointer group flex items-start justify-between ${
                                      settings.selectedModelId === model.id 
                                      ? (isDarkMode ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500/30' : 'bg-blue-50 border-blue-600 shadow-lg shadow-blue-50') 
                                      : (isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm')
                                    }`}
                                  >
                                     <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${settings.selectedModelId === model.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}><Zap size={20} /></div>
                                           <div>
                                              <p className="font-bold text-sm">{model.name}</p>
                                              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{model.id}</p>
                                           </div>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{model.description}</p>
                                        
                                        {settings.selectedModelId === model.id && (
                                           <div className="animate-in fade-in zoom-in-95 duration-200">
                                              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">{t('apiKeyInput')}</label>
                                              <div className="relative max-w-md">
                                                 <input 
                                                   type="password"
                                                   value={settings.modelApiKeys[model.id] || ""}
                                                   onChange={(e) => {
                                                      const newKeys = { ...settings.modelApiKeys, [model.id]: e.target.value };
                                                      setSettings(s => ({...s, modelApiKeys: newKeys}));
                                                   }}
                                                   placeholder={t('apiKeyPlaceholder')}
                                                   className={`w-full pl-4 pr-12 py-2.5 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-100 outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'}`}
                                                 />
                                                 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                                                    {settings.modelApiKeys[model.id] ? (
                                                       <Check size={14} className="text-green-500" />
                                                    ) : (
                                                       <Key size={14} className="text-slate-300" />
                                                    )}
                                                 </div>
                                              </div>
                                              <p className="mt-1.5 text-[9px] text-slate-400 italic">
                                                 {settings.modelApiKeys[model.id] ? t('maskedKey') : t('usingSystemKey')}
                                              </p>
                                           </div>
                                        )}
                                     </div>
                                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${settings.selectedModelId === model.id ? 'border-blue-600 bg-blue-600 shadow-sm' : 'border-slate-200 group-hover:border-slate-400'}`}>
                                        {settings.selectedModelId === model.id && <Check size={14} className="text-white" />}
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    )}
                    {keyTab === 'apikey' && (
                      <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="flex items-center justify-between"><SectionHeader title={t('apiKeys')} icon={Key} /><button onClick={generateApiKey} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-black transition-all shadow-lg"><Plus size={16} /><span>Generate New Key</span></button></div>
                         <div className="space-y-3">{apiKeys.map(k => (<div key={k.id} className={`p-5 border rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}><div className="flex-1 space-y-1"><div className="flex items-center space-x-2"><p className="font-mono text-sm font-bold">{k.key}</p><button className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors" title="Copy Key"><Copy size={12} /></button></div><p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Created: {k.created} • Last Used: {k.lastUsed}</p></div><button onClick={() => deleteApiKey(k.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button></div>))}</div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {(isParsing || isSuggestingFields || isExtractingFields || isSplitting || isSuggestingSplits || isGeneratingMindMap || isValidating || isTranslating) && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl z-[100] flex items-center space-x-4 animate-bounce border border-slate-700">
           <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
           <span className="text-sm font-bold">{isValidating ? t('comparing') : isTranslating ? 'Translating...' : 'AI Worker Active...'}</span>
        </div>
      )}
    </div>
  );
}
