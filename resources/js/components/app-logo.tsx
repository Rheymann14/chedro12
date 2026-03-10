import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const handleGovphClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.open('https://www.gov.ph/', '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <div className="ml-1 grid flex-1 text-left text-sm pr-4">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    <span
                        role="link"
                        tabIndex={0}
                        onClick={handleGovphClick}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleGovphClick(e as unknown as React.MouseEvent);
                            }
                        }}
                        className="font-bold text-3xl cursor-pointer"
                        title="Visit GOV.PH (opens in new tab)"
                    >
                        GOVPH
                    </span>
                </span>
            </div>
        </>
    );
}
