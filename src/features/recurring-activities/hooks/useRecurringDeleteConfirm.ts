import { useCallback, useState } from 'react';

interface DeleteConfirmState {
  show: boolean;
  id: string;
  title: string;
}

const initialState: DeleteConfirmState = {
  show: false,
  id: '',
  title: '',
};

export const useRecurringDeleteConfirm = (onDelete: (id: string) => void) => {
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(initialState);

  const openDeleteConfirm = useCallback((id: string, title: string) => {
    setDeleteConfirm({ show: true, id, title });
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm(initialState);
  }, []);

  const confirmDelete = useCallback(() => {
    onDelete(deleteConfirm.id);
    setDeleteConfirm(initialState);
  }, [deleteConfirm.id, onDelete]);

  return {
    deleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
  };
};
