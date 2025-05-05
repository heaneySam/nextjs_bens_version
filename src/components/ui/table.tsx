"use client"

import * as React from "react"
import { createContext, useContext } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils"

// Define the shape of the context value (can be expanded later)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TableContextProps {
  // Example: Add configuration or state later
  // isSortable?: boolean;
}

// Create the context
const TableContext = createContext<TableContextProps | undefined>(undefined);

// Custom hook to use the TableContext
const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
};

// Interface for new TableHead props
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  isSorted?: 'asc' | 'desc' | false;
  onSort?: (event: React.MouseEvent) => void;
  sortable?: boolean;
  canResize?: boolean;
  isResizing?: boolean;
  // Expect individual handlers directly
  onResizeMouseDown?: (event: React.MouseEvent) => void;
  onResizeTouchStart?: (event: React.TouchEvent) => void;
  stickyDirection?: 'left' | 'right';
  // We won't expect style here anymore, it comes from the main style prop
  // children is implicitly included
}

// Main Table component - Now provides the context
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & TableContextProps // Accept context-related props
>(({ className, ...props }, ref) => {
  // Define the context value based on props or internal state
  const contextValue: TableContextProps = {
    // Pass down any relevant props here
  };

  return (
    <TableContext.Provider value={contextValue}>
      <div
        data-slot="table-container"
        className="relative w-full overflow-x-auto" // Ensures horizontal scrolling
      >
        <table
          ref={ref}
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props} // Pass remaining props to the actual table element
        />
      </div>
    </TableContext.Provider>
  );
});
Table.displayName = "Table";

// TableHeader - Adding sticky positioning and background
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  // const context = useTableContext(); // Example of future context usage
  return (
    <thead
      ref={ref}
      data-slot="table-header"
      // Add sticky positioning, top offset, and background color
      className={cn(
        "[&_tr]:border-b sticky top-0 z-10 bg-background", // Added classes
        className
      )}
      {...props}
    />
  );
});
TableHeader.displayName = "TableHeader";

// TableBody - No context usage *yet*
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
});
TableBody.displayName = "TableBody";

// TableFooter - No context usage *yet*
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
});
TableFooter.displayName = "TableFooter";

// TableRow - Ensure data-state is applied correctly
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  // Add data-state prop explicitly if needed, though usually handled by parent
  React.HTMLAttributes<HTMLTableRowElement> & { 'data-state'?: string, onClick?: () => void }
>(({ className, 'data-state': dataState, onClick, ...props }, ref) => {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      // Use the passed data-state prop
      data-state={dataState}
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        onClick && "cursor-pointer", // Add cursor-pointer if onClick is provided
        className
      )}
      {...props}
      onClick={onClick} // Pass onClick handler
    />
  );
});
TableRow.displayName = "TableRow";

// TableHead - Adjusted padding for checkbox scenario
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  TableHeadProps
>(
  (
    {
      className,
      children,
      sortable,
      isSorted,
      onSort,
      canResize,
      isResizing,
      // Use individual handler props
      onResizeMouseDown,
      onResizeTouchStart,
      stickyDirection,
      ...props
    },
    ref
  ) => {
    const renderSortIcon = () => {
      if (!sortable) return null;
      if (isSorted === 'asc') return <ArrowUp className="ml-2 h-4 w-4 shrink-0" />;
      if (isSorted === 'desc') return <ArrowDown className="ml-2 h-4 w-4 shrink-0" />;
      return <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />;
    };

    const content = sortable ? (
      <Button
        variant="ghost"
        onClick={onSort}
        className="flex items-center px-1 py-0 h-auto -ml-1 data-[state=open]:bg-accent"
        disabled={!onSort}
      >
        {children}
        {renderSortIcon()}
        <span className="sr-only">
          {isSorted === 'desc' ? 'Sorted descending' : isSorted === 'asc' ? 'Sorted ascending' : 'Click to sort'}
        </span>
      </Button>
    ) : (
      children
    );
    const resizeHandlers = { onMouseDown: onResizeMouseDown, onTouchStart: onResizeTouchStart }; // Combine handlers

    return (
      <th
        ref={ref}
        data-slot="table-head"
        className={cn(
          "group relative", // Add group for hover interaction
          // Adjusted padding, especially for checkbox columns (pr-0 is removed by default, added via [&:has(...)])
          "text-foreground h-10 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pl-4 [&:has([role=checkbox])]:pr-0",
          sortable && "select-none", // Removed cursor-pointer here
          canResize && "cursor-col-resize", // Apply resize cursor to the whole TH
          stickyDirection === 'left' && "sticky left-0 z-20 bg-background",
          stickyDirection === 'right' && "sticky right-0 z-20 bg-background",
          className
        )}
        {...props}
        style={{ ...props.style }}
        aria-sort={
          isSorted === 'asc' ? 'ascending' :
          isSorted === 'desc' ? 'descending' :
          undefined
        }
      >
        <div className="flex items-center">
          {content} {/* Content now includes the sort button if sortable */}
        </div>

        {canResize && (
          <div
            {...resizeHandlers}
            className={cn(
              "absolute right-0 top-0 h-full w-[6px] cursor-col-resize select-none touch-none bg-border/50 opacity-0 group-hover:opacity-100", // Slightly wider, visible on TH hover
              isResizing && "bg-primary opacity-100" // Active resize style
            )}
            style={{ transform: 'translateX(50%)' }}
          />
        )}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

// TableCell - Adjusted padding for checkbox scenario
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { stickyDirection?: 'left' | 'right' }
>(({ className, style, children, stickyDirection, ...props }, ref) => { // Accept children explicitly
  return (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        // Adjusted padding, especially for checkbox columns (pr-0 is removed by default, added via [&:has(...)])
        "p-4 align-middle [&:has([role=checkbox])]:pl-4 [&:has([role=checkbox])]:pr-0",
        stickyDirection === 'left' && "sticky left-0 z-10 bg-background",
        stickyDirection === 'right' && "sticky right-0 z-10 bg-background",
        className
      )}
      style={style} // Apply passed style (e.g., width from column sizing)
      {...props}
    >
      {/* Render children directly */}
      {children}
    </td>
  );
});
TableCell.displayName = "TableCell";

// TableCaption - No context usage *yet*
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
});
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  useTableContext, // Export context hook if needed externally
};
