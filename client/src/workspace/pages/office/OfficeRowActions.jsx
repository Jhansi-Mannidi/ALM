import { AppIcon, Icons } from '../../../components/icons';
import FinanceActionsMenu from '../finance/FinanceActionsMenu';

export default function OfficeRowActions({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  disabled = false,
}) {
  const actions = [];

  if (onEdit) {
    actions.push({
      id: 'edit',
      label: editLabel,
      icon: Icons.pencil,
      onClick: onEdit,
    });
  }

  if (onDelete) {
    actions.push({
      id: 'delete',
      label: deleteLabel,
      icon: Icons.trash,
      onClick: onDelete,
      danger: true,
    });
  }

  if (!actions.length) return null;

  return <FinanceActionsMenu actions={actions} disabled={disabled} />;
}
