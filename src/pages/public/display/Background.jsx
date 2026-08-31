export default function DoorprizeBackground() {
  return (
    <svg 
      className="absolute inset-0 w-full h-full -z-10 pointer-events-none" 
      viewBox="0 0 1920 1080" 
      preserveAspectRatio="none"
    >
      <polygon points="1920,0 1380,0 1549,150 1920,147" fill="#08415c" />
      <rect x="1880" y="30" width="7" height="90" fill="#b39c4d" />
      <polygon points="1920,405 1920,1080 1500,1080" fill="#f1c335" />
      <rect x="0" y="959" width="1920" height="121" fill="#08415c" />
      <polygon points="0,605 0,1080 300,1080" fill="#f1c335" />
      <line x1="410" y1="1013" x2="580" y2="1013" stroke="#b39c4d" strokeWidth="4" />
      <line x1="1345" y1="1013" x2="1515" y2="1013" stroke="#b39c4d" strokeWidth="4" />
    </svg>
  );
}