import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import ColumnEditorFullView from '../components/schema/ColumnEditorFullView'

export default function ColumnEditorPage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tableName = searchParams.get('name') || 'Table'

  const handleClose = () => {
    // Navigate back to the previous page or settings
    navigate(-1)
  }

  return (
    <ColumnEditorFullView
      tableId={parseInt(tableId)}
      tableName={tableName}
      onClose={handleClose}
    />
  )
}
