export default function AppFooter() {
    return (
        <footer className="relative mt-4 border-t bg-[#efefef]">
            {/* Watermark/Seal on the left - hidden on mobile, visible on larger screens */}
            <div className="absolute top-1/2 left-2 z-10 -translate-y-1/2 transform opacity-100 hidden sm:block sm:pl-16 md:pl-20">
                <img src="/govph-seal.jpg" alt="Republic of the Philippines" className="h-24 w-auto sm:h-32 md:h-40" />
            </div>

            {/* Main content */}
            <div className="font-arial mx-auto grid w-full max-w-none grid-cols-1 gap-6 px-10 py-6 text-[12px] text-gray-600 md:max-w-6xl md:grid-cols-3 md:gap-6 md:pl-32">
                {/* Column 1: Republic of the Philippines */}
                <div className="max-w-xs">
                    <h3 className="mb-3 font-bold">REPUBLIC OF THE PHILIPPINES</h3>
                    <p className="font-arial leading-relaxed">All content is in the public domain unless otherwise stated.</p>
                </div>

                {/* Column 2: About GOVPH */}
                <div className="max-w-xs">
                    <h3 className="mb-3 font-bold">ABOUT GOVPH</h3>
                    <div className="font-arial space-y-2">
                        <p className="leading-relaxed">
                            Learn more about the Philippine government, its structure, how government works and the people behind it.
                        </p>
                        <div className="">
                            <div>
                                <a
                                    href="https://www.gov.ph/about-the-government"
                                    className="hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GOV.PH
                                </a>
                            </div>
                            <div>
                                <a href="https://www.gov.ph/data" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                    Open data portal
                                </a>
                            </div>
                            <div>
                                <a href="https://www.officialgazette.gov.ph/" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                    Official Gazette
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Government Links */}
                <div className="max-w-xs">
                    <h3 className="mb-3 font-bold">GOVERNMENT LINKS</h3>
                    <div className="font-arial">
                        <div>
                            <a href="https://op-proper.gov.ph/" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                Office of the President
                            </a>
                        </div>
                        <div>
                            <a href="https://www.ovp.gov.ph/" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                Office of the Vice President
                            </a>
                        </div>
                        <div>
                            <a href="https://web.senate.gov.ph/" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                Senate of the Philippines
                            </a>
                        </div>
                        <div>
                            <a href="https://www.congress.gov.ph/" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                House of Representatives
                            </a>
                        </div>
                        <div>
                            <a href="https://sc.judiciary.gov.ph/" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                Supreme Court
                            </a>
                        </div>
                        <div>
                            <a href="https://ca.judiciary.gov.ph/" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                Court of Appeals
                            </a>
                        </div>
                        <div>
                            <a href="https://sb.judiciary.gov.ph/" className="hover:underline" target="_blank" rel="noopener noreferrer">
                                Sandiganbayan
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to top button - fixed position */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed right-3 bottom-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-white transition-colors hover:bg-gray-700 sm:right-4 sm:bottom-5 sm:h-10 sm:w-10 sm:rounded-3xl"
                aria-label="Scroll to top"
            >
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>

        </footer>
    );
}
