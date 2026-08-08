"use client";

const statusColor = (s) => {
  switch (s) {
    case "Sampled": return "text-blue-600 bg-blue-50";
    case "InProcess": return "text-yellow-600 bg-yellow-50";
    case "Completed": return "text-green-600 bg-green-50";
    case "Approved": return "text-emerald-600 bg-emerald-50";
    case "Cancelled": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

export const getColumns = () => [
  {
    id: "sl",
    header: "SL",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "testCode",
    header: "Test Code",
  },
  {
    accessorKey: "testName",
    header: "Test Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor(status)}`}>
          {status}
        </span>
      );
    },
  },
];
