'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  Row,
  Cell,
  Header,
  HeaderGroup,
  ColumnSizingState,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { createCreditPoliticalRisk } from '@/app/(main)/risks/credit-political/actions';
import { toast } from "sonner";

// Sync this with the backend model/serializer
// --- Export the type --- 
export type CreditRiskEntry = {
  id: string; // UUIDs are strings
  name?: string;
  description?: string;
  insured?: string;
  country_of_insured?: string;
  counterparty?: string;
  country_of_counterparty?: string;
  product?: string; // Consider using the choice values: 'trade_credit', etc.
  country_of_risk?: string;
  creation_date?: string | null; // Backend uses DateField (nullable)
  inception_date?: string | null;
  expiry_date?: string | null;
  status?: string; // Consider using choice values: 'processing', etc.
  score?: number | null;
  attachments_count?: number | null;
  // Add other fields from RiskBase if needed (e.g., created_at, updated_at)
  created_at?: string;
  updated_at?: string;
  // Add new integration fields
  source_system?: string | null;
  source_record_id?: string | null;
  unstructured_data?: Record<string, unknown> | null; // Or `any` if preferred
};

// --- Define props for the table component ---
interface CreditPoliticalRiskTableProps {
  fetchedData: CreditRiskEntry[];
  riskClass: string;
}
// -----------------------------------------

// Placeholder Data (Matches image structure)
// --- REMOVE or COMMENT OUT Placeholder Data ---
/*
const placeholderData: CreditRiskEntry[] = [
  { id: 91, insured: 'Bank Inc.', counterparty: 'All Trade Inc.', product: 'Trade Credit', country_of_risk: 'Australia', creation_date: '05/02/2025', inception_date: '01/01/2025', expiry_date: '01/01/2030', status: 'Processing' },
  // ... other placeholder entries
];
*/
// -----------------------------------------

// Define Columns - Reordered and with default visibility in mind
export const columns: ColumnDef<CreditRiskEntry>[] = [
  // --- Always Visible Controls ---
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.getToggleSelectedHandler()?.(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false, // Keep Select always visible/hidable? User can still toggle in menu if true. Setting false for now.
    size: 40,
    minSize: 40,
    maxSize: 40,
    // --- Add meta for sticky positioning ---
    meta: {
      stickyDirection: 'left',
    },
    // --------------------------------------
  },
  // --- Default Visible Columns (User Specified Order) ---
  {
    accessorKey: 'insured',
    header: 'Insured',
    cell: ({ row }) => <div className="text-left">{row.getValue('insured') || '-'}</div>, // Handle potentially empty strings
  },
  {
    accessorKey: 'counterparty',
    header: 'Counterparty',
    cell: ({ row }) => <div className="text-left">{row.getValue('counterparty') || '-'}</div>, // Handle potentially empty strings
  },
  {
    accessorKey: 'country_of_risk', // Changed from 'country'
    header: 'Country(s) of Risk',
    cell: ({ row }) => {
      const country = row.original.country_of_risk;
      // TODO: Add flag lookup based on country or countryCode
      const flag = country === '-' ? '' : '🌍'; // Replace with actual flag component/emoji
      return <div className="flex items-center space-x-2">{flag} {country || '-'}</div>; // Handle null/empty
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusValue = row.original.status;
      // Map status to existing badge variants
      let variant: React.ComponentProps<typeof Badge>['variant'] = "secondary";
      switch (statusValue) {
        case 'bound': // Use backend choice keys
        case 'approved':
           variant = 'default'; // Map success to default (often green)
           break;
        case 'approving':
           variant = 'secondary'; // Map warning to secondary (adjust as needed)
           break;
        case 'new_deal':
           variant = 'outline'; // Keep outline
           break;
        case 'processing':
        default:
           variant = 'secondary'; // Keep secondary
           break;
      }
      // Render badge with an appropriate existing variant
      const displayStatus = String(statusValue || '-').replace('_', ' ');
      return <Badge variant={variant} className="capitalize">{displayStatus}</Badge>; // Format status key
    },
  },
  {
    accessorKey: 'attachments_count',
    header: 'Attachments',
    cell: ({ row }) => {
        const count = row.getValue('attachments_count') as number | null | undefined;
        // Display 0 if count is null/undefined or 0
        return <div className="text-center font-medium">{count || 0}</div>;
    },
    size: 100,
    enableHiding: true, // Allow hiding/showing via menu
  },
  {
    accessorKey: 'source_system',
    header: 'Source System',
    cell: ({ row }) => <div className="text-left font-medium">{row.getValue('source_system') || '-'}</div>,
    size: 120,
  },
  {
    accessorKey: 'unstructured_data',
    header: 'Raw Data',
    // Display a preview or indicator for JSON data
    cell: ({ row }) => {
        const rawData = row.getValue('unstructured_data');
        const preview = rawData ? JSON.stringify(rawData).substring(0, 50) + '...' : '-'; // Show first 50 chars
        return <div className="text-left font-mono text-xs truncate" title={rawData ? JSON.stringify(rawData, null, 2) : ''}>{preview}</div>;
    },
    size: 200, // Allow more space for the preview
  },
  // --- Default Hidden Columns ---
  {
    accessorKey: 'id',
    header: 'ID',
    // Display only a part of the UUID for brevity if desired
    cell: ({ row }) => <div className="text-left font-medium truncate" title={row.getValue('id')}>{String(row.getValue('id')).substring(0, 8)}...</div>,
    size: 100, // Adjust size for UUID
    enableHiding: true, // Allow hiding
  },
  {
    accessorKey: 'product',
    header: 'Product',
    // Display the readable choice label if possible, or format the key
    cell: ({ row }) => {
        const productValue = row.getValue('product');
        const displayValue = String(productValue || '-').replace('_', ' ');
        return <div className="text-left capitalize">{displayValue}</div>;
    },
     enableHiding: true, // Allow hiding
  },
  {
    accessorKey: 'creation_date', // Changed from 'creationDate'
    header: 'Creation Date',
    cell: ({ row }) => <div className="text-left">{row.getValue('creation_date') || '-'}</div>, // TODO: Format date
    enableHiding: true, // Allow hiding
  },
  {
    accessorKey: 'inception_date', // Changed from 'inceptionDate'
    header: 'Inception Date',
    cell: ({ row }) => <div className="text-left">{row.getValue('inception_date') || '-'}</div>, // TODO: Format date
    enableHiding: true, // Allow hiding
  },
  {
    accessorKey: 'expiry_date', // Changed from 'expiryDate'
    header: 'Expiry Date',
    cell: ({ row }) => <div className="text-left">{row.getValue('expiry_date') || '-'}</div>, // TODO: Format date
    enableHiding: true, // Allow hiding
  },
  {
    accessorKey: 'source_record_id',
    header: 'Source ID',
    // Display truncated like the main ID
    cell: ({ row }) => {
        const sourceId = row.getValue('source_record_id') as string | undefined | null;
        const displayId = sourceId ? (sourceId.length > 15 ? `${sourceId.substring(0, 15)}...` : sourceId) : '-';
        return <div className="text-left font-medium truncate" title={sourceId || ''}>{displayId}</div>;
    },
    size: 150,
    enableHiding: true, // Allow hiding
  },
  // --- Always Visible Controls (End) ---
  {
    id: 'actions',
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {/* Ensure entry.id is treated as a string (UUID) */}
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(entry.id)}>
              Copy Entry ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Entry</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
    enableSorting: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
    // --- Add meta for sticky positioning ---
    meta: {
      stickyDirection: 'right',
    },
    // --------------------------------------
  },
];

// Update component to accept props
export default function CreditPoliticalRiskTable({ fetchedData, riskClass }: CreditPoliticalRiskTableProps) {
  // --- Debugging Logs ---
  console.log('CreditPoliticalRiskTable received fetchedData:', fetchedData);
  console.log('CreditPoliticalRiskTable received riskClass:', riskClass);
  // --------------------

  const router = useRouter();

  // Use fetchedData instead of placeholderData
  // Ensure fetchedData is available before initializing state
  const data = React.useMemo(() => fetchedData || [], [fetchedData]);

  // --- Debugging Logs ---
  console.log('Data prepared for useReactTable:', data);
  // --------------------

  // Hook for managing pending state during server action
  const [isPending, startTransition] = useTransition();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    // Columns to hide by default
    id: false,
    product: false,
    creation_date: false,
    inception_date: false,
    expiry_date: false,
    source_record_id: false,
    // Note: 'select' and 'actions' have enableHiding: false, so they stay visible
    // Others (insured, counterparty, country_of_risk, status, source_system, unstructured_data) default to visible
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onColumnSizingChange: setColumnSizing,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnSizing,
      rowSelection,
      columnVisibility,
    },
    defaultColumn: {
      minSize: 50,
      size: 150,
      maxSize: 500,
    },
    // TODO: Add pagination, filtering, row selection features later
  });

  // Get rows model for logging effect dependency
  const rowModel = table.getRowModel();

  // --- Debugging Logs ---
  React.useEffect(() => {
    // Log rows once the table instance is stable
    console.log('Table rows generated by useReactTable:', rowModel.rows);
  }, [rowModel.rows, table]); // Add table as dependency, use rowModel.rows
  // --------------------

  const handleRowClick = (row: Row<CreditRiskEntry>) => {
    const riskId = row.original.id;
    // Construct the path using the riskClass prop and the row's ID
    const path = `/risks/${riskClass}/${riskId}`;
    console.log(`Navigating to: ${path}`);
    router.push(path);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between pt-4">
        <Button
          onClick={() => {
            startTransition(async () => {
              console.log("Create button clicked, starting transition...");
              const result = await createCreditPoliticalRisk();
              console.log("Server action finished:", result);
              if (result.success) {
                toast.success("New risk entry created successfully!");
                // Data will refresh due to revalidatePath in the action
              } else {
                toast.error(`Failed to create risk: ${result.error}`, {
                   description: result.details ? JSON.stringify(result.details) : undefined,
                });
              }
            });
          }}
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create New Risk"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 className="mr-2 h-4 w-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    onSelect={(e) => e.preventDefault()}
                  >
                    {column.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table style={{ width: table.getTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<CreditRiskEntry>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<CreditRiskEntry, unknown>) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();
                  const toggleSortingHandler = header.column.getToggleSortingHandler();
                  const canResize = header.column.getCanResize();
                  const isResizing = header.column.getIsResizing();
                  const resizeHandler = canResize ? header.getResizeHandler() : undefined;
                  // --- Get sticky direction from column meta ---
                  const stickyDirection = header.column.columnDef.meta?.stickyDirection;
                  // -------------------------------------------

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                      sortable={canSort}
                      isSorted={canSort ? isSorted : undefined}
                      onSort={canSort ? toggleSortingHandler : undefined}
                      canResize={canResize}
                      isResizing={isResizing}
                      onResizeMouseDown={resizeHandler}
                      stickyDirection={stickyDirection}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<CreditRiskEntry>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  onClick={() => handleRowClick(row)}
                >
                  {row.getVisibleCells().map((cell: Cell<CreditRiskEntry, unknown>) => {
                    // --- Get sticky direction from column meta ---
                    const stickyDirection = cell.column.columnDef.meta?.stickyDirection;
                    // -------------------------------------------
                    return (
                      <TableCell
                         key={cell.id}
                         style={{ width: cell.column.getSize() }}
                         stickyDirection={stickyDirection}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Helper components (like Badge variants) can be defined here or imported
// Example adding custom variants to Badge if needed (requires extending theme)
// declare module "@/components/ui/badge" {
//   interface BadgeProps {
//     variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
//   }
// } // Commented out for now 