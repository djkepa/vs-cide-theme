import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material/Select';

const genders = ['Male', 'Female', 'Other'];

interface Client {
  id: string;
  apId: string;
  name: string;
  surname: string;
  gender: string;
}

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    apId: '',
    name: '',
    surname: '',
    gender: '',
  });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{
    id: string;
    apId: string;
    name: string;
    surname: string;
    gender: string;
  } | null>(null);
  const [editingClient, setEditingClient] = useState<{
    id: string;
    apId: string;
    name: string;
    surname: string;
    gender: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/users');
      const clients = response.data;
      setClients(clients);
      setFilteredClients(clients);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({ ...prev, gender: e.target.value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = clients.filter(
      (client: any) =>
        client.name.toLowerCase().includes(query) ||
        client.surname.toLowerCase().includes(query) ||
        client.apId.toLowerCase().includes(query),
    );

    setFilteredClients(filtered);

    setPage(0);
  };

  const handleOpenDialog = (client: any = null) => {
    setEditingClient(client);
    setFormData({
      apId: client?.apId || '',
      name: client?.name || '',
      surname: client?.surname || '',
      gender: client?.gender || '',
    });
    setDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!formData.apId || !formData.name || !formData.surname || !formData.gender) {
      setError('All fields are required.');
      return;
    }

    try {
      if (editingClient) {
        await axiosInstance.put(`/api/v1/users/${editingClient.id}`, formData);
        setSuccess('Client updated successfully.');
      } else {
        await axiosInstance.post('/api/v1/users', formData);
        setSuccess('Client added successfully.');
      }
      fetchClients();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save client.');
    }
  };

  const handleOpenDeleteDialog = (client: any) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleDelete = async () => {
    if (clientToDelete) {
      try {
        await axiosInstance.delete(`/api/v1/users/${clientToDelete.id}`);
        fetchClients();
        handleCloseDeleteDialog();
      } catch (err) {
        console.error('Failed to delete client:', err);
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    console.log(page);
  };

  const displayedClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Typography
        variant="h4"
        textAlign="center"
        sx={{ mb: 4 }}
      >
        Client Management
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, width: '90%' }}
      >
        <TextField
          fullWidth
          placeholder="Search by ID, Name, or Surname"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Client
        </Button>
      </Stack>
      <Table sx={{ maxWidth: '90%', minHeight: '400px' }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Surname</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedClients.length > 0 ? (
            displayedClients.map((client: any) => (
              <TableRow
                onClick={() => navigate(`/client/${client.id}`)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
              >
                <TableCell sx={{ verticalAlign: 'top' }}>{client.apId}</TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{client.name}</TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{client.surname}</TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{client.gender}</TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent TableRow's onClick
                      handleOpenDialog(client);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent TableRow's onClick
                      handleOpenDeleteDialog(client);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography>No clients found.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={filteredClients.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 8, 10, 20]}
      />

      {/* Delete Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the client "{clientToDelete?.name}{' '}
            {clientToDelete?.surname}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
          <Stack
            sx={{ padding: '20px 0' }}
            spacing={3}
          >
            <TextField
              fullWidth
              name="apId"
              label="Customer ID"
              value={formData.apId}
              onChange={handleInputChange}
              disabled={!!editingClient}
              required
            />
            <TextField
              fullWidth
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              name="surname"
              label="Surname"
              value={formData.surname}
              onChange={handleInputChange}
              required
            />
            <Select
              value={formData.gender || ''}
              onChange={handleSelectChange}
              name="gender"
              label="Gender"
              fullWidth
              displayEmpty
            >
              <MenuItem value="">Select Gender</MenuItem>
              {genders.map((gender) => (
                <MenuItem
                  key={gender}
                  value={gender}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </MenuItem>
              ))}
            </Select>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientManagement;
