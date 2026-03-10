// Minimal toast utility (no external deps)
// Usage: showToast('Saved successfully', { variant: 'success' })

type ToastOptions = {
	variant?: 'success' | 'error' | 'info';
	durationMs?: number;
};

const ensureContainer = (): HTMLElement => {
	let container = document.getElementById('app-toast-container');
	if (!container) {
		container = document.createElement('div');
		container.id = 'app-toast-container';
		container.style.position = 'fixed';
		container.style.top = '16px';
		container.style.right = '16px';
		container.style.zIndex = '9999';
		container.style.display = 'flex';
		container.style.flexDirection = 'column';
		container.style.gap = '8px';
		document.body.appendChild(container);
	}
	return container;
};

export function showToast(message: string, opts?: ToastOptions) {
	const { variant = 'success', durationMs = 3000 } = opts || {};
	const container = ensureContainer();

	const toast = document.createElement('div');
	toast.style.padding = '10px 14px';
	toast.style.borderRadius = '8px';
	toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
	toast.style.color = variant === 'error' ? '#7f1d1d' : variant === 'info' ? '#0c4a6e' : '#065f46';
	toast.style.background = variant === 'error' ? '#fee2e2' : variant === 'info' ? '#e0f2fe' : '#dcfce7';
	toast.style.border = '1px solid ' + (variant === 'error' ? '#fecaca' : variant === 'info' ? '#bae6fd' : '#bbf7d0');
	toast.style.fontSize = '14px';
	toast.style.maxWidth = '360px';
	toast.style.transition = 'opacity 200ms ease, transform 200ms ease';
	toast.style.opacity = '0';
	toast.style.transform = 'translateY(-6px)';
	toast.textContent = message;

	container.appendChild(toast);
	requestAnimationFrame(() => {
		toast.style.opacity = '1';
		toast.style.transform = 'translateY(0)';
	});

	const timeout = window.setTimeout(() => {
		toast.style.opacity = '0';
		toast.style.transform = 'translateY(-6px)';
		window.setTimeout(() => {
			toast.remove();
			if (container.childElementCount === 0) container.remove();
		}, 220);
	}, durationMs);

	// Click to dismiss early
	toast.addEventListener('click', () => {
		window.clearTimeout(timeout);
		toast.style.opacity = '0';
		toast.style.transform = 'translateY(-6px)';
		window.setTimeout(() => {
			toast.remove();
			if (container.childElementCount === 0) container.remove();
		}, 220);
	});
}
