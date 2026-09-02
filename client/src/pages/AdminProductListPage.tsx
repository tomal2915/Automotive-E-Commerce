import { useState } from "react";
import { Container, Typography, Box, Button, IconButton, Chip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchAdminProducts, deleteProductRequest } from "../features/products/productAdminApi";
import type { Product } from "../features/products/productTypes";

export default function AdminProductListPage() {
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () => fetchAdminProducts({ page: page + 1, limit: 20 }),
  });

  const deleteProduct = useMutation({
    mutationFn: deleteProductRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // public listing too
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteProduct.mutate(id);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "image",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <img
          src={params.row.images?.[0] || "/placeholder-part.svg"}
          alt=""
          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, marginTop: 8 }}
        />
      ),
    },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "make", headerName: "Make", width: 110 },
    { field: "model", headerName: "Model", width: 110 },
    { field: "category", headerName: "Category", width: 120 },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      valueFormatter: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value > 0 ? "success" : "error"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => navigate(`/admin/products/${params.row._id}/edit`)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row._id, params.row.title)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manage Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/products/new")}
        >
          Add Product
        </Button>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={data?.products ?? []}
          columns={columns}
          getRowId={(row: Product) => row._id}
          loading={isLoading}
          paginationMode="server"
          rowCount={data?.pagination.total ?? 0}
          paginationModel={{ page, pageSize: 20 }}
          onPaginationModelChange={(model) => setPage(model.page)}
          pageSizeOptions={[20]}
          disableRowSelectionOnClick
        />
      </Box>
    </Container>
  );
}