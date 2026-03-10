import IssuanceForm, { IssuanceRecord } from '@/components/issuances/IssuanceForm';

interface EditIssuanceCardProps {
	issuance: IssuanceRecord;
	onCancel: () => void;
	onSaved?: (payload: unknown) => void;
	onError?: (error: unknown) => void;
}

export default function EditIssuanceCard({ issuance, onCancel, onSaved, onError }: EditIssuanceCardProps) {
	return <IssuanceForm mode="edit" issuanceId={issuance.id} initial={issuance} onCancel={onCancel} onSaved={onSaved} onError={onError} />;
}
