import logoUrl from '../assets/moex-logo.svg';

interface MoexLogoProps {
  height?: number;
}

export function MoexLogo({ height = 32 }: MoexLogoProps) {
  return <img src={logoUrl} height={height} alt="MOEX" style={{ display: 'block' }} />;
}
