import IssuanceForm from '@/components/issuances/IssuanceForm';

interface CreateIssuanceCardProps {
	onCancel: () => void;
	onSaved?: (payload: unknown) => void;
	onError?: (error: unknown) => void;
}

export default function CreateIssuanceCard({ onCancel, onSaved, onError }: CreateIssuanceCardProps) {
	return <IssuanceForm mode="create" onCancel={onCancel} onSaved={onSaved} onError={onError} />;
}
