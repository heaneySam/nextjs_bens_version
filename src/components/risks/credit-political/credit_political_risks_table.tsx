'use client';

import * as React from 'react';
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

// Define the shape of our data
// TODO: Refine based on actual backend data model
type CreditRiskEntry = {
  id: number;
  insured: string;
  counterparty: string;
  product: 'Trade Credit' | 'Trade Finance' | 'Project Finance';
  country: string; // Store country name, maybe add code for flag later
  countryCode?: string; // Optional: for flag lookup
  creationDate: string; // Use string for now, format later
  inceptionDate: string;
  expiryDate: string;
  status: 'Processing' | 'Bound' | 'Approving' | 'New Deal' | 'Approved'; // Add 'Approved' from image
};

// Placeholder Data (Matches image structure)
const placeholderData: CreditRiskEntry[] = [
  { id: 91, insured: 'Bank Inc.', counterparty: 'All Trade Inc.', product: 'Trade Credit', country: 'Australia', creationDate: '05/02/2025', inceptionDate: '01/01/2025', expiryDate: '01/01/2030', status: 'Processing' },
  { id: 92, insured: 'Lets Go Banking', counterparty: 'All Trade Inc.', product: 'Trade Finance', country: 'Philippines', creationDate: '12/02/2025', inceptionDate: '01/10/2024', expiryDate: '30/09/2028', status: 'Bound' },
  { id: 95, insured: 'Lets Go Banking', counterparty: 'Tall Trade Limited', product: 'Trade Credit', country: 'Chile', creationDate: '06/02/2025', inceptionDate: '01/02/2025', expiryDate: '01/02/2030', status: 'Processing' },
  { id: 72, insured: 'HSBC Holdings plc', counterparty: 'Apple Inc', product: 'Trade Credit', country: 'United States of America', creationDate: '23/08/2024', inceptionDate: '01/01/2025', expiryDate: '01/01/2030', status: 'Processing' }, // Corrected counterparty
  { id: 89, insured: 'Cargill', counterparty: 'Claro Company', product: 'Trade Credit', country: 'Argentina', creationDate: '03/02/2025', inceptionDate: '03/02/2025', expiryDate: '03/02/2028', status: 'Approving' },
  { id: 83, insured: 'Citigroup Inc.', counterparty: 'America Movil', product: 'Trade Finance', country: 'United States of America', creationDate: '24/01/2025', inceptionDate: '01/07/2025', expiryDate: '31/12/2026', status: 'Processing' },
  { id: 69, insured: 'General Electric Company (GE)', counterparty: 'Coca-Cola Company', product: 'Trade Finance', country: 'United Kingdom', creationDate: '30/08/2024', inceptionDate: '01/02/2024', expiryDate: '01/02/2027', status: 'Bound' }, // Shortened UK
  { id: 78, insured: 'Aon', counterparty: 'Amazon Inc', product: 'Trade Credit', country: 'Antarctica', creationDate: '23/10/2024', inceptionDate: '01/11/2024', expiryDate: '01/11/2026', status: 'Processing' },
  { id: 80, insured: 'General Electric Company (GE)', counterparty: 'Coca-Cola Company', product: 'Trade Finance', country: 'United Kingdom', creationDate: '15/11/2024', inceptionDate: '01/02/2024', expiryDate: '01/02/2027', status: 'Processing' }, // Shortened UK
  { id: 79, insured: '-', counterparty: '-', product: 'Project Finance', country: '-', creationDate: '15/11/2024', inceptionDate: '01/01/2026', expiryDate: '31/12/2027', status: 'New Deal' },
  { id: 82, insured: '-', counterparty: '-', product: 'Trade Credit', country: '-', creationDate: '25/11/2024', inceptionDate: '01/01/2025', expiryDate: '01/01/2027', status: 'New Deal' },
  { id: 66, insured: 'Lockheed Martin', counterparty: 'Government of Egypt', product: 'Trade Credit', country: 'Egypt', creationDate: '21/08/2024', inceptionDate: '01/05/2024', expiryDate: '01/05/2034', status: 'Processing' },
  { id: 74, insured: '-', counterparty: '-', product: 'Trade Credit', country: '-', creationDate: '27/08/2024', inceptionDate: '01/01/2025', expiryDate: '01/01/2027', status: 'New Deal' },
  { id: 75, insured: 'Apple Inc', counterparty: 'Aon', product: 'Trade Credit', country: 'United States of America', creationDate: '28/08/2024', inceptionDate: '01/01/2025', expiryDate: '01/01/2026', status: 'Processing' },
  { id: 70, insured: 'General Electric Company (GE)', counterparty: 'Coca-Cola Company', product: 'Trade Finance', country: 'Brazil', creationDate: '22/08/2024', inceptionDate: '01/02/2024', expiryDate: '01/02/2027', status: 'Processing' },
  { id: 76, insured: 'General Electric Company (GE)', counterparty: 'Coca-Cola Company', product: 'Trade Finance', country: 'Brazil', creationDate: '28/08/2024', inceptionDate: '01/02/2024', expiryDate: '01/02/2027', status: 'Processing' },
  { id: 68, insured: 'Citigroup Inc.', counterparty: 'Claro Company', product: 'Project Finance', country: 'Argentina', creationDate: '21/08/2024', inceptionDate: '01/07/2024', expiryDate: '01/08/2029', status: 'Approved' },
];

// Define Columns - Simplified Headers
export const columns: ColumnDef<CreditRiskEntry>[] = [
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
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="text-left font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'insured',
    header: 'Insured',
    cell: ({ row }) => <div className="text-left">{row.getValue('insured')}</div>,
  },
  {
    accessorKey: 'counterparty',
    header: 'Counterparty',
    cell: ({ row }) => <div className="text-left">{row.getValue('counterparty')}</div>,
  },
  {
    accessorKey: 'product',
    header: 'Product',
    cell: ({ row }) => <div className="text-left">{row.getValue('product')}</div>,
  },
  {
    accessorKey: 'country',
    header: 'Country(s) of Risk',
    cell: ({ row }) => {
      const country = row.original.country;
      // TODO: Add flag lookup based on country or countryCode
      const flag = country === '-' ? '' : '🌍'; // Replace with actual flag component/emoji
      return <div className="flex items-center space-x-2">{flag} {country}</div>;
    },
  },
  {
    accessorKey: 'creationDate',
    header: 'Creation Date',
    cell: ({ row }) => <div className="text-left">{row.getValue('creationDate')}</div>, // TODO: Format date
  },
  {
    accessorKey: 'inceptionDate',
    header: 'Inception Date',
    cell: ({ row }) => <div className="text-left">{row.getValue('inceptionDate')}</div>, // TODO: Format date
  },
  {
    accessorKey: 'expiryDate',
    header: 'Expiry Date',
    cell: ({ row }) => <div className="text-left">{row.getValue('expiryDate')}</div>, // TODO: Format date
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      // Map status to existing badge variants
      let variant: React.ComponentProps<typeof Badge>['variant'] = "secondary";
      switch (status) {
        case 'Bound':
        case 'Approved':
           variant = 'default'; // Map success to default (often green)
           break;
        case 'Approving':
           variant = 'secondary'; // Map warning to secondary (adjust as needed)
           break;
        case 'New Deal':
           variant = 'outline'; // Keep outline
           break;
        case 'Processing':
        default:
           variant = 'secondary'; // Keep secondary
           break;
      }
      // Render badge with an appropriate existing variant
      return <Badge variant={variant} className="capitalize">{status.toLowerCase()}</Badge>;
    },
  },
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(entry.id.toString())}>
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
  },
];

export default function CreditPoliticalRiskTable() {
  // TODO: Replace placeholderData with fetched data prop
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = React.useState(() => [...placeholderData]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

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

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-end">
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
                  >
                    {column.id}
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
                >
                  {row.getVisibleCells().map((cell: Cell<CreditRiskEntry, unknown>) => {
                    return (
                      <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
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