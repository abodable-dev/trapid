#!/usr/bin/env python3
"""
Convert Heroicons imports to Lucide React icons.
This script replaces @heroicons/react imports with lucide-react equivalents.
"""

import re
import os
from pathlib import Path

# Mapping of common Heroicons to Lucide React equivalents
ICON_MAPPING = {
    'XMarkIcon': 'X',
    'CheckIcon': 'Check',
    'PlusIcon': 'Plus',
    'MinusIcon': 'Minus',
    'PencilIcon': 'Pencil',
    'TrashIcon': 'Trash2',
    'MagnifyingGlassIcon': 'Search',
    'ChevronUpIcon': 'ChevronUp',
    'ChevronDownIcon': 'ChevronDown',
    'ChevronLeftIcon': 'ChevronLeft',
    'ChevronRightIcon': 'ChevronRight',
    'ArrowPathIcon': 'RefreshCw',
    'CheckCircleIcon': 'CheckCircle',
    'XCircleIcon': 'XCircle',
    'ExclamationTriangleIcon': 'AlertTriangle',
    'InformationCircleIcon': 'Info',
    'UserIcon': 'User',
    'UsersIcon': 'Users',
    'EnvelopeIcon': 'Mail',
    'PhoneIcon': 'Phone',
    'MapPinIcon': 'MapPin',
    'BuildingOfficeIcon': 'Building',
    'CalendarIcon': 'Calendar',
    'ClockIcon': 'Clock',
    'DocumentIcon': 'File',
    'DocumentTextIcon': 'FileText',
    'DocumentDuplicateIcon': 'Copy',
    'FolderIcon': 'Folder',
    'FolderOpenIcon': 'FolderOpen',
    'TableCellsIcon': 'Table',
    'Cog6ToothIcon': 'Settings',
    'CogIcon': 'Settings',
    'BellIcon': 'Bell',
    'HomeIcon': 'Home',
    'ShoppingCartIcon': 'ShoppingCart',
    'CurrencyDollarIcon': 'DollarSign',
    'BanknotesIcon': 'Banknote',
    'ChartBarIcon': 'BarChart',
    'ArrowsRightLeftIcon': 'ArrowLeftRight',
    'LinkIcon': 'Link',
    'CloudIcon': 'Cloud',
    'SparklesIcon': 'Sparkles',
    'EyeIcon': 'Eye',
    'EyeSlashIcon': 'EyeOff',
    'LockClosedIcon': 'Lock',
    'ShieldCheckIcon': 'ShieldCheck',
    'ChatBubbleLeftRightIcon': 'MessageCircle',
    'PaperAirplaneIcon': 'Send',
    'ArrowDownTrayIcon': 'Download',
    'ArrowUpTrayIcon': 'Upload',
    'PaperClipIcon': 'Paperclip',
    'PhotoIcon': 'Image',
    'VideoCameraIcon': 'Video',
    'MusicalNoteIcon': 'Music',
    'MicrophoneIcon': 'Mic',
    'SpeakerWaveIcon': 'Volume2',
    'Bars3Icon': 'Menu',
    'EllipsisVerticalIcon': 'MoreVertical',
    'EllipsisHorizontalIcon': 'MoreHorizontal',
    'FunnelIcon': 'Filter',
    'AdjustmentsHorizontalIcon': 'SlidersHorizontal',
    'PresentationChartBarIcon': 'Presentation',
    'RocketLaunchIcon': 'Rocket',
    'TagIcon': 'Tag',
    'BookmarkIcon': 'Bookmark',
    'StarIcon': 'Star',
    'HeartIcon': 'Heart',
    'FireIcon': 'Flame',
    'BoltIcon': 'Zap',
    'CubeIcon': 'Box',
    'GlobeAltIcon': 'Globe',
    'ServerIcon': 'Server',
    'CommandLineIcon': 'Terminal',
    'CodeBracketIcon': 'Code',
    'WrenchIcon': 'Wrench',
    'BeakerIcon': 'FlaskConical',
    'BugAntIcon': 'Bug',
    'CpuChipIcon': 'Cpu',
    'SignalIcon': 'Signal',
    'WifiIcon': 'Wifi',
    'DocumentCheckIcon': 'FileCheck',
    'ChevronUpDownIcon': 'ChevronsUpDown',
    'ArrowLeftIcon': 'ArrowLeft',
    'ArrowRightIcon': 'ArrowRight',
    'ArrowDownIcon': 'ArrowDown',
    'ArrowUpIcon': 'ArrowUp',
    'LightBulbIcon': 'Lightbulb',
    'BriefcaseIcon': 'Briefcase',
    'BookOpenIcon': 'BookOpen',
    'QuestionMarkCircleIcon': 'HelpCircle',
    'DocumentArrowUpIcon': 'FileUp',
    'DocumentArrowDownIcon': 'FileDown',
    'ClipboardDocumentListIcon': 'ClipboardList',
    'CalendarDaysIcon': 'CalendarDays',
    'BookmarkIcon': 'Bookmark',
    'PlusCircleIcon': 'PlusCircle',
    'ExclamationCircleIcon': 'AlertCircle',
    'UserPlusIcon': 'UserPlus',
    'UserGroupIcon': 'Users',
    'UserCircleIcon': 'UserCircle',
    'CloudArrowDownIcon': 'CloudDownload',
    'ChatBubbleLeftIcon': 'MessageSquare',
    'PencilSquareIcon': 'Edit',
    'SwatchIcon': 'Palette',
    'HashtagIcon': 'Hash',
    'ClipboardDocumentCheckIcon': 'ClipboardCheck',
    'ArrowPathRoundedSquareIcon': 'RefreshCcw',
    'IdentificationIcon': 'IdCard',
    'StarIcon': 'Star',
    'BuildingStorefrontIcon': 'Store',
    'CloudArrowUpIcon': 'CloudUpload',
    'Squares2X2Icon': 'Grid2x2',
    'ArrowsPointingOutIcon': 'Maximize2',
    'CalculatorIcon': 'Calculator',
}

def convert_file(file_path):
    """Convert Heroicons imports to Lucide React in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Check if file has Heroicons imports
        if '@heroicons/react' not in content:
            return False

        # Extract all Heroicons being imported
        import_pattern = r'import\s*\{([^}]+)\}\s*from\s*[\'"]@heroicons/react/\d+/\w+[\'"]'
        matches = re.findall(import_pattern, content)

        if not matches:
            return False

        # Get all icon names being imported
        heroicons_used = set()
        for match in matches:
            icons = [icon.strip() for icon in match.split(',')]
            heroicons_used.update(icons)

        # Map to Lucide icons
        lucide_icons = []
        unmapped_icons = []

        for heroicon in heroicons_used:
            if heroicon in ICON_MAPPING:
                lucide_icons.append(ICON_MAPPING[heroicon])
            else:
                unmapped_icons.append(heroicon)

        if unmapped_icons:
            print(f"  Warning in {file_path.name}: Unmapped icons: {', '.join(unmapped_icons)}")

        # Remove all Heroicons imports
        content = re.sub(r'import\s*\{[^}]+\}\s*from\s*[\'"]@heroicons/react/\d+/\w+[\'"]\s*\n?', '', content)

        # Add Lucide React import if we have mapped icons
        if lucide_icons:
            lucide_import = f"import {{ {', '.join(sorted(set(lucide_icons)))} }} from 'lucide-react'\n"

            # Find where to insert (after other imports)
            import_section_end = 0
            for match in re.finditer(r'^import\s+.*$', content, re.MULTILINE):
                import_section_end = match.end()

            if import_section_end > 0:
                content = content[:import_section_end] + '\n' + lucide_import + content[import_section_end:]
            else:
                content = lucide_import + content

        # Replace icon usage in JSX (Heroicon -> Lucide name)
        for heroicon, lucide in ICON_MAPPING.items():
            # Replace component usage: <HeroIcon ... /> -> <LucideIcon ... />
            content = re.sub(rf'<{heroicon}\b', f'<{lucide}', content)
            content = re.sub(rf'</{heroicon}>', f'</{lucide}>', content)

            # Replace in props like icon={HeroIcon}
            content = re.sub(rf'\b{heroicon}\b(?=\s*[,}}\)])', lucide, content)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to convert all JSX files."""
    src_dir = Path('/Users/jakebaird/trapid/frontend/src')

    if not src_dir.exists():
        print(f"Error: {src_dir} does not exist")
        return

    # Find all JSX files with Heroicons
    jsx_files = [f for f in src_dir.rglob('*.jsx') if '@heroicons' in f.read_text(errors='ignore')]

    print(f"Found {len(jsx_files)} JSX files with Heroicons imports")

    modified_count = 0
    for jsx_file in jsx_files:
        if convert_file(jsx_file):
            modified_count += 1
            print(f"Converted: {jsx_file.relative_to(src_dir)}")

    print(f"\nConversion complete!")
    print(f"Converted {modified_count} files")

if __name__ == '__main__':
    main()
