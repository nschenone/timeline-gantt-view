/**
 * SideTableRenderer — Notion-style resizable property table on the left.
 * Rows are 1:1 aligned with timeline bar rows.
 */

import type { App, TFile } from 'obsidian';
import type { SabidurianEntry, SabidurianGroup } from '../model/SabidurianEntry';
import { BAR_HEIGHT, GROUP_HEADER_HEIGHT, compareEntriesForLayout } from '../model/LayoutEngine';
import { formatSabidurianDate } from '../utils/dateUtils';

export interface TableColumn {
  key: string;        // Property display name
  propId: string;     // BasesPropertyId
}

export interface SideTableLayout {
  contentHeight: number;
  getRowY: (row: number) => number;
}

const DEFAULT_TABLE_WIDTH = 220;
const MIN_TABLE_WIDTH = 120;
const MAX_TABLE_WIDTH = 500;

export class SideTableRenderer {
  private wrapperEl: HTMLElement;
  private tableEl: HTMLElement;
  private headerEl: HTMLElement;
  private bodyEl: HTMLElement;
  private dividerEl: HTMLElement;
  private collapseBtn: HTMLElement;

  private app: App;
  private tableWidth: number;
  private collapsed = false;
  private onWidthChange: ((width: number) => void) | null = null;
  private onRowHover: ((entryIndex: number | null) => void) | null = null;
  private onGroupToggle: ((groupName: string) => void) | null = null;

  constructor(
    parentEl: HTMLElement,
    app: App,
    initialWidth?: number,
  ) {
    this.app = app;
    this.tableWidth = initialWidth ?? DEFAULT_TABLE_WIDTH;

    this.wrapperEl = parentEl.createDiv({ cls: 'sabidurian-side-table-wrapper' });
    this.wrapperEl.style.width = `${this.tableWidth}px`;

    // Header
    this.headerEl = this.wrapperEl.createDiv({ cls: 'sabidurian-side-table-header' });

    // Scrollable body
    this.bodyEl = this.wrapperEl.createDiv({ cls: 'sabidurian-side-table-body' });

    // Table inside body
    this.tableEl = this.bodyEl.createDiv({ cls: 'sabidurian-side-table' });

    // Resizable divider
    this.dividerEl = parentEl.createDiv({ cls: 'sabidurian-divider' });
    this.setupDividerDrag();

    // Collapse button
    this.collapseBtn = this.dividerEl.createDiv({ cls: 'sabidurian-divider-btn' });
    this.collapseBtn.setText('‹');
    this.collapseBtn.addEventListener('click', () => this.toggleCollapse());
  }

  render(
    entries: SabidurianEntry[],
    columns: TableColumn[],
    layout: SideTableLayout,
  ): void {
    this.headerEl.empty();
    this.tableEl.empty();

    if (this.collapsed) return;

    this.applyContentHeight(layout.contentHeight);

    // Header row
    const headerRow = this.headerEl.createDiv({ cls: 'sabidurian-st-header-row' });
    // Title column (always first)
    headerRow.createDiv({ cls: 'sabidurian-st-cell sabidurian-st-cell-title', text: 'Name' });
    for (const col of columns) {
      headerRow.createDiv({ cls: 'sabidurian-st-cell', text: col.key });
    }

    // Sort by assigned lane first so DOM order mirrors the vertical layout.
    const sorted = [...entries].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return compareEntriesForLayout(a, b);
    });

    // Body rows — positioned from the same lane anchors used by the bars.
    for (const entry of sorted) {
      const row = this.tableEl.createDiv({ cls: 'sabidurian-st-row' });
      row.style.top = `${layout.getRowY(entry.row)}px`;
      row.style.height = `${BAR_HEIGHT}px`;

      // Title cell — clickable
      const titleCell = row.createDiv({ cls: 'sabidurian-st-cell sabidurian-st-cell-title' });
      const titleLink = titleCell.createEl('a', {
        cls: 'sabidurian-st-link',
        text: entry.label,
      });
      titleLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.app.workspace.getLeaf(false).openFile(entry.file);
      });

      // Hover preview
      titleLink.addEventListener('mouseover', (e) => {
        this.app.workspace.trigger('hover-link', {
          event: e,
          source: 'sabidurian-timeline',
          hoverParent: titleLink,
          targetEl: titleLink,
          linktext: entry.file.path,
          sourcePath: entry.file.path,
        });
      });

      // Property cells
      for (const col of columns) {
        const val = entry.properties[col.key] ?? '';
        const cell = row.createDiv({ cls: 'sabidurian-st-cell' });
        cell.setText(val === 'null' ? '' : val);
      }

      // Row hover sync
      row.addEventListener('mouseenter', () => {
        row.classList.add('sabidurian-st-row-hover');
        this.onRowHover?.(entries.indexOf(entry));
      });
      row.addEventListener('mouseleave', () => {
        row.classList.remove('sabidurian-st-row-hover');
        this.onRowHover?.(null);
      });
    }
  }

  /**
   * Render grouped entries with group header rows that span full width.
   * Collapsed groups show only the header.
   */
  renderGrouped(
    groups: SabidurianGroup[],
    allEntries: SabidurianEntry[],
    columns: TableColumn[],
    layout: SideTableLayout,
  ): void {
    this.headerEl.empty();
    this.tableEl.empty();

    if (this.collapsed) return;

    this.applyContentHeight(layout.contentHeight);

    // Header row
    const headerRow = this.headerEl.createDiv({ cls: 'sabidurian-st-header-row' });
    headerRow.createDiv({ cls: 'sabidurian-st-cell sabidurian-st-cell-title', text: 'Name' });
    for (const col of columns) {
      headerRow.createDiv({ cls: 'sabidurian-st-cell', text: col.key });
    }

    for (const group of groups) {
      // Group header row
      const groupRow = this.tableEl.createDiv({ cls: 'sabidurian-st-group-row' });
      groupRow.style.top = `${group.headerY}px`;
      groupRow.style.height = `${GROUP_HEADER_HEIGHT}px`;

      const chevron = groupRow.createEl('span', {
        cls: 'sabidurian-st-group-chevron',
        text: group.collapsed ? '▶' : '▼',
      });
      groupRow.createEl('span', {
        cls: 'sabidurian-st-group-name',
        text: `${group.name || '(No value)'}`,
      });
      groupRow.createEl('span', {
        cls: 'sabidurian-st-group-count',
        text: `${group.entries.length}`,
      });

      groupRow.style.cursor = 'pointer';
      groupRow.addEventListener('click', () => {
        this.onGroupToggle?.(group.name);
      });

      // Skip entries for collapsed groups
      if (group.collapsed) continue;

      // Entry rows (sorted by start date within group)
      const sorted = [...group.entries].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return compareEntriesForLayout(a, b);
      });
      for (const entry of sorted) {
        const row = this.tableEl.createDiv({ cls: 'sabidurian-st-row sabidurian-st-row-grouped' });
        row.style.top = `${layout.getRowY(entry.row)}px`;
        row.style.height = `${BAR_HEIGHT}px`;

        // Title cell — clickable, indented
        const titleCell = row.createDiv({ cls: 'sabidurian-st-cell sabidurian-st-cell-title sabidurian-st-cell-indented' });
        const titleLink = titleCell.createEl('a', {
          cls: 'sabidurian-st-link',
          text: entry.label,
        });
        titleLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.app.workspace.getLeaf(false).openFile(entry.file);
        });
        titleLink.addEventListener('mouseover', (e) => {
          this.app.workspace.trigger('hover-link', {
            event: e,
            source: 'sabidurian-timeline',
            hoverParent: titleLink,
            targetEl: titleLink,
            linktext: entry.file.path,
            sourcePath: entry.file.path,
          });
        });

        // Property cells
        for (const col of columns) {
          const val = entry.properties[col.key] ?? '';
          const cell = row.createDiv({ cls: 'sabidurian-st-cell' });
          cell.setText(val === 'null' ? '' : val);
        }

        // Row hover sync
        row.addEventListener('mouseenter', () => {
          row.classList.add('sabidurian-st-row-hover');
          this.onRowHover?.(allEntries.indexOf(entry));
        });
        row.addEventListener('mouseleave', () => {
          row.classList.remove('sabidurian-st-row-hover');
          this.onRowHover?.(null);
        });
      }
    }
  }

  /** Set a callback for group collapse/expand toggle. */
  setGroupToggleCallback(cb: (groupName: string) => void): void {
    this.onGroupToggle = cb;
  }

  private applyContentHeight(contentHeight: number): void {
    this.tableEl.style.height = `${contentHeight}px`;
  }

  private setupDividerDrag(): void {
    let startX = 0;
    let startWidth = 0;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(MIN_TABLE_WIDTH, Math.min(MAX_TABLE_WIDTH, startWidth + delta));
      this.tableWidth = newWidth;
      this.wrapperEl.style.width = `${newWidth}px`;
      this.onWidthChange?.(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('sabidurian-resizing');
    };

    this.dividerEl.addEventListener('mousedown', (e) => {
      // Don't start drag from collapse button
      if ((e.target as HTMLElement).classList.contains('sabidurian-divider-btn')) return;
      e.preventDefault();
      startX = e.clientX;
      startWidth = this.tableWidth;
      document.body.classList.add('sabidurian-resizing');
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  private toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.wrapperEl.style.width = '0px';
      this.wrapperEl.classList.add('sabidurian-side-table-collapsed');
      this.collapseBtn.setText('›');
    } else {
      this.wrapperEl.style.width = `${this.tableWidth}px`;
      this.wrapperEl.classList.remove('sabidurian-side-table-collapsed');
      this.collapseBtn.setText('‹');
    }
  }

  /** Set a callback for row hover events (to sync bar highlighting). */
  setRowHoverCallback(cb: (entryIndex: number | null) => void): void {
    this.onRowHover = cb;
  }

  /** Set a callback for width changes (to persist in config). */
  setWidthChangeCallback(cb: (width: number) => void): void {
    this.onWidthChange = cb;
  }

  /** Get the scrollable body element (for scroll sync). */
  get scrollBody(): HTMLElement {
    return this.bodyEl;
  }

  get element(): HTMLElement {
    return this.wrapperEl;
  }

  get divider(): HTMLElement {
    return this.dividerEl;
  }

  get isCollapsed(): boolean {
    return this.collapsed;
  }

  get width(): number {
    return this.tableWidth;
  }

  destroy(): void {
    this.wrapperEl.remove();
    this.dividerEl.remove();
  }
}
