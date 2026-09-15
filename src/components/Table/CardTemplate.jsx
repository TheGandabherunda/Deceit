import React from 'react';
import goldWallpaper from '../../assets/cards/gold-texture-wallpaper.jpg';
import leatherTexture from '../../assets/cards/leather-macro-shot.jpg';

// King Icon (from public/cards/King.svg with 3D metal gold effect)
const KingIcon = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#card-metal-icon)" fill="url(#card-gold-pattern)">
      <path
        d="M33.334 133.333V120H126.667V133.333H33.334ZM33.334 110L24.834 56.4997C24.6118 56.4997 24.3618 56.5275 24.084 56.583C23.8062 56.6386 23.5562 56.6663 23.334 56.6663C20.5562 56.6663 18.1951 55.6941 16.2507 53.7497C14.3062 51.8052 13.334 49.4441 13.334 46.6663C13.334 43.8886 14.3062 41.5275 16.2507 39.583C18.1951 37.6386 20.5562 36.6663 23.334 36.6663C26.1118 36.6663 28.4729 37.6386 30.4173 39.583C32.3618 41.5275 33.334 43.8886 33.334 46.6663C33.334 47.4441 33.2507 48.1663 33.084 48.833C32.9173 49.4997 32.7229 50.1108 32.5007 50.6663L53.334 59.9997L74.1673 31.4997C72.9451 30.6108 71.9451 29.4441 71.1673 27.9997C70.3895 26.5552 70.0007 24.9997 70.0007 23.333C70.0007 20.5552 70.9729 18.1941 72.9173 16.2497C74.8618 14.3052 77.2229 13.333 80.0007 13.333C82.7784 13.333 85.1395 14.3052 87.084 16.2497C89.0284 18.1941 90.0007 20.5552 90.0007 23.333C90.0007 24.9997 89.6118 26.5552 88.834 27.9997C88.0562 29.4441 87.0562 30.6108 85.834 31.4997L106.667 59.9997L127.501 50.6663C127.278 50.1108 127.084 49.4997 126.917 48.833C126.751 48.1663 126.667 47.4441 126.667 46.6663C126.667 43.8886 127.64 41.5275 129.584 39.583C131.528 37.6386 133.89 36.6663 136.667 36.6663C139.445 36.6663 141.806 37.6386 143.751 39.583C145.695 41.5275 146.667 43.8886 146.667 46.6663C146.667 49.4441 145.695 51.8052 143.751 53.7497C141.806 55.6941 139.445 56.6663 136.667 56.6663C136.445 56.6663 136.195 56.6386 135.917 56.583C135.64 56.5275 135.39 56.4997 135.167 56.4997L126.667 110H33.334Z"
      />
    </g>
  </svg>
);

// Queen Icon (from public/cards/Queen.svg with 3D metal gold effect)
const QueenIcon = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#card-metal-icon)" fill="url(#card-gold-pattern)">
      <path
        d="M38.9057 140L24.8477 64.0526C20.9515 64.7895 17.5028 63.8947 14.5017 61.3684C11.5006 58.8421 10 51.5789 10 51.5789C10 48.1053 11.2373 45.1316 13.7119 42.6579C16.1866 40.1842 19.1614 38.9474 22.6364 38.9474C26.1114 38.9474 29.0862 40.1842 31.5608 42.6579C34.0354 45.1316 35.2727 48.1053 35.2727 51.5789C35.2727 53.0526 35.0621 54.4211 34.6409 55.6842C34.2197 56.9474 33.5879 58.1053 32.7455 59.1579C35.0621 60.5263 37.4051 61.6579 39.7744 62.5526C42.1437 63.4474 44.6447 63.8947 47.2773 63.8947C51.9106 63.8947 56.2017 62.7368 60.1506 60.4211C64.0994 58.1053 67.1795 54.9474 69.3909 50.9474L73.3398 43.6842C71.339 42.5263 69.7595 41 68.6011 39.1053C67.4428 37.2105 66.8636 35.0526 66.8636 32.6316C66.8636 29.1579 68.1009 26.1842 70.5756 23.7105C73.0502 21.2368 76.025 20 79.5 20C82.975 20 85.9498 21.2368 88.4244 23.7105C90.8991 26.1842 92.1364 29.1579 92.1364 32.6316C92.1364 35.0526 91.5572 37.2105 90.3989 39.1053C89.2405 41 87.661 42.5263 85.6602 43.6842L89.6091 50.9474C91.8205 54.9474 94.9006 58.1053 98.8494 60.4211C102.798 62.7368 107.089 63.8947 111.723 63.8947C114.355 63.8947 116.856 63.4737 119.226 62.6316C121.595 61.7895 123.938 60.6842 126.255 59.3158C125.412 58.2632 124.78 57.0789 124.359 55.7632C123.938 54.4474 123.727 53.0526 123.727 51.5789C123.727 48.1053 124.965 45.1316 127.439 42.6579C129.914 40.1842 132.889 38.9474 136.364 38.9474C139.839 38.9474 142.813 40.1842 145.288 42.6579C147.763 45.1316 149 48.1053 149 51.5789C149 55.5789 147.499 58.8421 144.498 61.3684C141.497 63.8947 138.048 64.7895 134.152 64.0526L120.094 140H38.9057Z"
      />
    </g>
  </svg>
);

// Ace Icon (from public/cards/Ace.svg with 3D metal gold effect)
const AceIcon = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#card-metal-icon)" fill="url(#card-gold-pattern)">
      <path
        d="M79.0002 22C82.9902 23.33 84.0002 25.82 86.0602 29.25C94.6902 43.09 105 55.5 116.88 66.69C123.97 73.68 129 83.39 129.44 93.38C129.18 101.43 126.31 108.64 120.75 114.52C116.06 118.47 111.21 120.38 105.06 120.06C99.6102 119.25 92.9902 116.99 89.0002 113C89.8102 120.5 92.3702 125.96 96.3402 132.34C98.0002 135 98.0002 135 100 139C87.1302 139 74.2602 139 61.0002 139C63.2302 134.54 65.7702 130.34 68.3402 126.07C70.7602 121.58 72.0002 118.12 72.0002 113C71.2602 113.51 71.2602 113.51 70.5002 114.02C64.0102 118.28 58.2102 120.82 50.3402 119.66C43.7702 117.8 38.5302 113.42 34.9302 107.7C31.0802 100.67 30.9102 92.84 32.6502 85.09C35.9402 75.06 42.4002 68.48 49.8102 61.22C61.1502 50.02 71.7502 36.24 79.0002 22Z"
      />
      <path d="M115 64C115.99 64.33 116.98 64.66 118 65C117.01 65 116.02 65 115 65C115 64.67 115 64.34 115 64Z" />
      <path d="M111 60C111.99 60.33 112.98 60.66 114 61C113.01 61 112.02 61 111 61C111 60.67 111 60.34 111 60Z" />
      <path d="M55 52C55.66 52.33 56.32 52.66 57 53C56.01 53 55.02 53 54 53C54.33 52.67 54.66 52.34 55 52Z" />
      <path d="M40 68C40.33 68.66 40.66 69.32 41 70C40.34 69.67 39.68 69.34 39 69C39.33 68.67 39.66 68.34 40 68Z" />
      <path d="M68 36C68.33 36.66 68.66 37.32 69 38C68.34 37.67 67.68 37.34 67 37C67.33 36.67 67.66 36.34 68 36Z" />
      <path d="M62 132C64 133 64 133 64 133L62 132Z" />
    </g>
  </svg>
);

// Joker Icon (from public/cards/Joker.svg with 3D metal gold effect)
const JokerIcon = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#card-metal-icon)" fill="url(#card-gold-pattern)">
      <path
        d="M58.3762 31.1324C58.5976 31.1324 58.8189 31.1358 59.047 31.1358C67.3549 31.1997 74.3145 33.8113 80.2846 39.6633C88.3611 47.9319 92.2551 59.1652 94.6633 70.2505C94.945 70.1026 95.2268 69.9547 95.5152 69.8035C104.574 65.249 115.072 63.6726 124.849 66.8086C128.757 68.1565 132.144 70.2102 135.247 72.9395C135.505 73.1479 135.76 73.3597 136.028 73.5748C142.354 78.8687 145.423 87.2315 146.235 95.2615C146.342 96.8984 146.375 98.5219 146.315 100.166C145.879 100.142 145.443 100.122 144.994 100.102C142.867 100.098 141.036 100.663 139.272 101.846C138.265 101.846 138.265 101.846 137.531 101.15C137.383 100.996 137.236 100.841 137.085 100.683C134.14 97.6076 130.347 95.1539 126.191 94.1153C125.906 94.038 125.624 93.9607 125.329 93.8834C121.485 93.3893 117.974 94.4548 114.898 96.8178C112.728 98.6429 110.964 100.569 109.377 102.915C109.233 103.13 109.089 103.345 108.941 103.564C108.244 104.633 107.67 105.651 107.244 106.854C106.114 109.89 106.114 109.89 104.662 110.612C102.304 111.443 99.8419 111.93 97.3465 111.93C97.2694 111.735 97.1922 111.543 97.1117 111.345C94.3413 104.3 94.3413 104.3 89.2969 98.8211C89.1929 99.1471 89.1929 99.1471 89.0889 99.4832C88.4382 100.908 87.5226 102.085 86.5902 103.335C85.0239 105.466 83.5313 107.611 82.1864 109.89C81.851 110.441 81.851 110.441 81.2472 111.258C80.9152 111.258 80.5831 111.258 80.241 111.258C80.1303 111.032 80.0197 110.807 79.909 110.575C79.3992 109.533 78.886 108.495 78.3728 107.453C78.2018 107.1 78.0307 106.747 77.853 106.38C76.6791 104.011 75.4783 101.601 73.8684 99.4933C73.1775 99.4126 73.1775 99.4126 72.7683 99.9168C72.6073 100.115 72.4496 100.31 72.2819 100.515C72.1042 100.734 71.9264 100.955 71.7386 101.184C71.5508 101.423 71.3596 101.661 71.1617 101.907C70.9705 102.149 70.776 102.391 70.5748 102.643C67.5461 106.407 67.5461 106.407 65.148 110.585C64.8159 110.585 64.4839 110.585 64.1418 110.585C62.1931 107.308 60.5764 104.152 59.4461 100.502C53.2915 105.127 53.2915 105.127 49.3841 111.594C48.0257 111.365 46.825 110.945 45.5471 110.437C43.9439 109.796 43.9439 109.796 42.2736 109.382C41.1802 108.827 41.1198 108.629 40.7073 107.52C40.5228 106.938 40.3484 106.357 40.1807 105.772C38.8156 101.49 37.0983 96.7404 33.0534 94.3036C30.8163 93.2448 28.7334 93.1238 26.3655 93.8599C23.8399 94.8044 22.3809 96.0615 21.2104 98.4849C20.4423 100.522 20.3551 102.713 20.2042 104.871C19.9895 104.935 19.7749 105.002 19.5535 105.07C17.2292 105.873 15.9479 106.925 14.5023 108.905C10.7123 107.278 8.39804 102.28 6.80153 98.7202C5.25197 94.6901 5.04738 89.6617 6.68414 85.6147C6.90215 85.1643 6.90215 85.1643 7.12351 84.7039C7.2778 84.3778 7.43208 84.0518 7.59307 83.7156C11.1752 76.9663 17.3533 72.3748 24.5409 70.143C36.6858 66.9431 49.7799 70.1295 60.7877 75.6285C61.0259 68.4556 60.7877 59.3265 56.0921 53.4443C54.8545 52.1839 53.59 51.5083 51.7923 51.3772C50.122 51.4881 48.4785 52.0293 46.9994 52.8057C46.3655 53.1082 46.3655 53.1082 45.3593 53.1082C44.8897 52.4931 44.8897 52.4931 44.4168 51.6763C43.1221 49.6428 41.6531 48.6714 39.322 48.0663C38.4265 47.9218 37.5377 47.821 36.6388 47.7302C37.3868 42.8934 40.1438 38.2515 43.9539 35.1861C48.4785 32.0803 52.9494 31.0719 58.3762 31.1324Z"
      />
      <path
        d="M72.4703 106.33C73.798 106.777 73.9719 107.325 74.6842 108.53C74.8012 108.723 74.9149 108.913 75.032 109.109C78.6304 115.252 78.6304 115.252 79.8277 118.515C81.0249 117.036 82.1319 115.496 83.2355 113.945C83.4261 113.678 83.6167 113.411 83.8107 113.137C85.4092 110.886 86.9777 108.618 88.5228 106.33C92.4757 108.07 94.1913 113.021 95.6929 116.782C95.8668 117.245 96.044 117.709 96.2146 118.176C96.4386 118.065 96.6627 117.956 96.8934 117.841C103.023 115.018 109.371 115.34 115.946 115.469C115.454 116.582 114.822 117.421 114.046 118.349C112.568 120.193 111.398 122.143 110.24 124.204C110.046 124.539 109.856 124.874 109.658 125.22C108.251 127.701 106.92 130.212 105.578 132.73C84.4996 132.73 63.4207 132.73 41.7031 132.73C41.372 130.943 41.0409 129.156 40.6998 127.315C40.2483 125.853 40.2483 125.853 39.6765 124.648C39.5795 124.434 39.4825 124.218 39.3822 123.998C38.2886 121.635 37.0077 119.374 35.7302 117.113C35.1818 116.139 34.7203 115.174 34.3457 114.115C36.5696 112.988 39.8269 114.199 42.0475 114.92C44.4822 115.746 46.7864 116.626 49.0605 117.838C49.1742 117.631 49.2879 117.428 49.4049 117.215C50.659 115.025 52.0201 112.913 53.7424 111.069C53.9631 111.069 54.1839 111.069 54.4113 111.069C54.4113 110.845 54.4113 110.622 54.4113 110.392C54.9497 109.82 54.9497 109.82 55.6654 109.187C56.0132 108.872 56.0132 108.872 56.371 108.55C57.08 108.026 57.5683 107.826 58.4244 107.684C58.4746 107.884 58.5214 108.087 58.5749 108.293C59.5548 111.969 61.3774 114.93 63.7752 117.838C64.0227 117.503 64.2702 117.164 64.5243 116.819C66.5509 114.071 68.601 111.349 70.7045 108.662C71.3065 107.894 71.8951 107.119 72.4703 106.33Z"
      />
      <path
        d="M28.0986 107.808C30.1895 109.374 31.4825 111.502 31.8987 114.013C32.1566 116.488 31.3209 119.075 29.7734 121.078C27.4349 123.172 25.1308 123.998 21.9257 123.926C19.6525 123.737 17.7886 122.703 16.0794 121.282C14.5319 119.501 13.82 117.555 13.5449 115.252C13.82 112.606 14.7829 110.26 16.7672 108.396C20.1168 105.882 24.4877 105.634 28.0986 107.808Z"
      />
      <path
        d="M41.7603 50.9357C43.6078 52.2907 44.8428 54.0126 45.4221 56.2236C45.7383 58.9369 45.5153 61.2735 43.9307 63.5341C42.1797 65.6955 40.4054 66.7366 37.6391 67.1101C34.9427 67.2489 32.9154 66.6474 30.8148 64.942C28.7809 62.9723 28.0552 61.1843 27.9453 58.3718C28.0385 55.7774 28.7409 53.9233 30.4819 51.9899C33.731 49.032 38.0053 48.8172 41.7603 50.9357Z"
      />
      <path
        d="M150.726 103.174C152.638 104.894 154.078 106.405 154.34 108.958C154.364 111.385 154.368 113.369 152.823 115.409C152.627 115.704 152.435 115.995 152.232 116.299C150.38 118.051 148.038 119.076 145.416 119.129C142.571 119.08 140.466 118.233 138.397 116.391C136.593 114.447 135.912 112.172 135.947 109.622C136.226 107.268 137.39 105.132 139.19 103.505C142.714 101.273 147.122 100.628 150.726 103.174Z"
      />
    </g>
  </svg>
);

export const STATUS_CONFIG = {
  truth: {
    strokeBase: '#064E3B', // Deep forest emerald (dark shade, no black)
    shimmerGradient: 'conic-gradient(from 0deg, #6EE7B7 0deg, rgba(16, 185, 129, 0.4) 10deg, rgba(5, 150, 105, 0.1) 20deg, transparent 25deg, transparent 335deg, rgba(5, 150, 105, 0.1) 340deg, rgba(16, 185, 129, 0.4) 350deg, #6EE7B7 360deg)'
  },
  bluff: {
    strokeBase: '#7F1D1D', // Deep wine red (dark shade, no black)
    shimmerGradient: 'conic-gradient(from 0deg, #FCA5A5 0deg, rgba(239, 68, 68, 0.4) 10deg, rgba(185, 28, 28, 0.1) 20deg, transparent 25deg, transparent 335deg, rgba(185, 28, 28, 0.1) 340deg, rgba(239, 68, 68, 0.4) 350deg, #FCA5A5 360deg)'
  }
};

export const CARD_CONFIG = {
  K: {
    rank: 'K',
    name: 'King',
    bg: '#FFC700', // Popping Rich Gold-Yellow
    border: 'rgba(0, 0, 0, 0.35)',
    strokeBase: '#78350F', // Deep amber yellow (dark shade, no black)
    shimmerGradient: 'conic-gradient(from 0deg, #FDE047 0deg, rgba(245, 158, 11, 0.4) 10deg, rgba(217, 119, 6, 0.1) 20deg, transparent 25deg, transparent 335deg, rgba(217, 119, 6, 0.1) 340deg, rgba(245, 158, 11, 0.4) 350deg, #FDE047 360deg)',
    textureBlend: 'overlay',
    textureOpacity: 0.22,
    Icon: KingIcon
  },
  Q: {
    rank: 'Q',
    name: 'Queen',
    bg: '#E60039', // Popping Vibrant Crimson
    border: 'rgba(0, 0, 0, 0.35)',
    strokeBase: '#831843', // Deep wine crimson (dark shade, no black)
    shimmerGradient: 'conic-gradient(from 0deg, #FB7185 0deg, rgba(225, 29, 72, 0.4) 10deg, rgba(190, 18, 60, 0.1) 20deg, transparent 25deg, transparent 335deg, rgba(190, 18, 60, 0.1) 340deg, rgba(225, 29, 72, 0.4) 350deg, #FB7185 360deg)',
    textureBlend: 'overlay',
    textureOpacity: 0.22,
    Icon: QueenIcon
  },
  A: {
    rank: 'A',
    name: 'Ace',
    bg: '#FFFFFF', // Popping Brilliant Crisp White
    border: 'rgba(0, 0, 0, 0.28)',
    strokeBase: '#64748B', // Slate silver (dark shade of white theme, no black)
    shimmerGradient: 'conic-gradient(from 0deg, #FFFFFF 0deg, rgba(203, 213, 225, 0.4) 10deg, rgba(148, 163, 184, 0.1) 20deg, transparent 25deg, transparent 335deg, rgba(148, 163, 184, 0.1) 340deg, rgba(203, 213, 225, 0.4) 350deg, #FFFFFF 360deg)',
    textureBlend: 'multiply',
    textureOpacity: 0.12,
    Icon: AceIcon
  },
  JOKER: {
    rank: 'JOKER',
    name: 'Joker',
    bg: '#8B14F2', // Popping Royal Electric Purple
    border: 'rgba(0, 0, 0, 0.35)',
    strokeBase: '#4C1D95', // Deep royal purple (dark shade, no black)
    shimmerGradient: 'conic-gradient(from 0deg, #E879F9 0deg, rgba(168, 85, 247, 0.4) 10deg, rgba(126, 34, 206, 0.1) 20deg, transparent 25deg, transparent 335deg, rgba(126, 34, 206, 0.1) 340deg, rgba(168, 85, 247, 0.4) 350deg, #E879F9 360deg)',
    textureBlend: 'overlay',
    textureOpacity: 0.22,
    Icon: JokerIcon
  }
};

export const normalizeCardRank = (rank) => {
  if (!rank) return 'A';
  const r = String(rank).toUpperCase();
  if (r === 'K' || r === 'KING') return 'K';
  if (r === 'Q' || r === 'QUEEN') return 'Q';
  if (r === 'JOKER' || r === 'J') return 'JOKER';
  return 'A';
};

export const CardTemplate = ({
  card,
  isSelected = false,
  shimmerStatus = null, // 'truth' | 'bluff' | null
  className = '',
  onClick
}) => {
  const rankKey = normalizeCardRank(card?.rank);
  const config = CARD_CONFIG[rankKey] || CARD_CONFIG.A;
  const Icon = config.Icon;

  const statusStyle = shimmerStatus ? STATUS_CONFIG[shimmerStatus] : null;
  const hasShimmer = isSelected || !!statusStyle;
  const currentStrokeBase = statusStyle ? statusStyle.strokeBase : config.strokeBase;
  const currentGradient = statusStyle ? statusStyle.shimmerGradient : config.shimmerGradient;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <>
      {/* SHARED SVG DEFS FOR GOLD PATTERN & 3D METAL EMBLEMS (FLUSH STAMPED / STICKED TO CARD) */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
        <defs>
          {/* Universal Rich Multi-Stop Vector Gold Gradient Fallback (Zero Load Delay, 100% Mobile GPU Safe) */}
          <linearGradient id="card-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B8" />
            <stop offset="18%" stopColor="#F5D061" />
            <stop offset="38%" stopColor="#D49E24" />
            <stop offset="58%" stopColor="#9E6D0D" />
            <stop offset="78%" stopColor="#E5B942" />
            <stop offset="90%" stopColor="#BA8918" />
            <stop offset="100%" stopColor="#FFEAA0" />
          </linearGradient>

          {/* Real Gold Wallpaper Pattern (from kannadiga-master) */}
          <pattern id="card-gold-pattern" patternUnits="userSpaceOnUse" width="160" height="160">
            <rect width="160" height="160" fill="url(#card-gold-gradient)" />
            <image href={goldWallpaper} xlinkHref={goldWallpaper} x="0" y="0" width="160" height="160" preserveAspectRatio="xMidYMid slice" />
          </pattern>

          {/* 3D Metal Gold Filter FOR ICONS (Stuck flush to card surface, no floating drop shadow) */}
          <filter id="card-metal-icon" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur" />
            <feDiffuseLighting in="blur" surfaceScale="2.5" diffuseConstant="1.2" lightingColor="#ffffff" result="diffuse">
              <fePointLight x="70" y="45" z="60" />
            </feDiffuseLighting>
            <feSpecularLighting in="blur" surfaceScale="2.5" specularConstant="1.1" specularExponent="22" lightingColor="#fffadb" result="specular">
              <fePointLight x="70" y="45" z="60" />
            </feSpecularLighting>
            <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="diffuse" in2="SourceGraphic" result="shadedTexture" />
            <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="shadedTexture" in2="specular" result="litPaint" />
            <feComposite operator="in" in="litPaint" in2="SourceAlpha" result="finalMetal" />
            {/* Crisp micro-contact adhesive edge flush to card (NO floating blur) */}
            <feDropShadow dx="0" dy="0.3" stdDeviation="0.15" floodColor="#000000" floodOpacity="0.25" />
          </filter>

          {/* 3D Metal Gold Filter FOR TEXT (Tailored for 85x24 text coordinate space) */}
          <filter id="card-metal-text" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="blur" />
            <feDiffuseLighting in="blur" surfaceScale="1.8" diffuseConstant="1.2" lightingColor="#ffffff" result="diffuse">
              <fePointLight x="40" y="6" z="25" />
            </feDiffuseLighting>
            <feSpecularLighting in="blur" surfaceScale="1.8" specularConstant="1.1" specularExponent="24" lightingColor="#fffadb" result="specular">
              <fePointLight x="40" y="6" z="25" />
            </feSpecularLighting>
            <feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0" in="diffuse" in2="SourceGraphic" result="shadedTexture" />
            <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="shadedTexture" in2="specular" result="litPaint" />
            <feComposite operator="in" in="litPaint" in2="SourceAlpha" result="finalMetal" />
            {/* Crisp micro-contact adhesive edge flush to card (NO floating blur) */}
            <feDropShadow dx="0" dy="0.08" stdDeviation="0.05" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>
      </svg>

      <div
        onClick={onClick}
        onMouseMove={handleMouseMove}
        data-card="true"
        className={`relative select-none rounded-lg sm:rounded-xl cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.85)] ${className}`}
        style={{
          aspectRatio: '250 / 350'
        }}
      >
        {/* Tight, natural subtle ambient glow blooming outside card */}
        {hasShimmer && (
          <div 
            className="absolute -inset-1 sm:-inset-1.5 rounded-xl sm:rounded-2xl pointer-events-none z-0 overflow-hidden"
            style={{
              filter: 'blur(5px)',
              opacity: 0.28,
              willChange: 'transform'
            }}
          >
            <div 
              className="card-border-beam"
              style={{
                background: currentGradient
              }}
            />
          </div>
        )}

        {/* Crisp Border Track & Shimmer Layer — strictly clipped to 1.5px perimeter border */}
        <div 
          className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10"
          style={{
            backgroundColor: hasShimmer ? currentStrokeBase : config.border,
            padding: '1.5px'
          }}
        >
          {hasShimmer && (
            <div 
              className="card-border-beam"
              style={{
                background: currentGradient
              }}
            />
          )}
        </div>

        {/* Inner Card Face - Concentric rounded corners in respective popping card color */}
        <div 
          className="relative w-full h-full rounded-[7px] sm:rounded-[11px] overflow-hidden z-20"
          style={{ 
            margin: '1.5px',
            width: 'calc(100% - 3px)',
            height: 'calc(100% - 3px)',
            backgroundColor: config.bg 
          }}
        >
            {/* Real Leather Macro Texture Overlay (from kannadiga-master) */}
            <div 
              className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${leatherTexture}")`,
                opacity: config.textureOpacity ?? 0.22,
                mixBlendMode: config.textureBlend ?? 'overlay'
              }}
            />

          {/* Interactive Mouse & Central Ambient Lighting Sheen */}
          <div 
            className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-200"
            style={{
              background: 'radial-gradient(circle 120px at var(--mouse-x, 50%) var(--mouse-y, 35%), rgba(255,255,255,0.3) 0%, transparent 100%)',
              mixBlendMode: 'screen'
            }}
          />

          {/* Top Left: 8px padding top and left in Gloock font with 3D Gold Metal Emblem Effect (Flush Stuck) */}
          <div 
            className="absolute z-20 flex flex-col items-start leading-none pointer-events-none select-none font-gloock card-corner-label"
            style={{ top: 8, left: 8 }}
          >
            <svg viewBox="0 0 85 24" className="h-4 sm:h-5 w-auto overflow-visible pointer-events-none">
              <text
                x="0"
                y="18"
                fontFamily="Gloock, serif"
                fontSize="18"
                fontWeight="400"
                fill="url(#card-gold-pattern)"
                filter="url(#card-metal-text)"
                letterSpacing="0.03em"
              >
                {config.name}
              </text>
            </svg>
          </div>

          {/* Center: 3D Metal Gold Icon directly on textured card (stuck flat to surface) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-3">
            <Icon className="w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain" />
          </div>

          {/* Bottom Right: 8px padding bottom and right in Gloock font with 3D Gold Metal Effect, straight (not reversed) */}
          <div 
            className="absolute z-20 flex flex-col items-end leading-none pointer-events-none select-none font-gloock card-corner-label"
            style={{ bottom: 8, right: 8 }}
          >
            <svg viewBox="0 0 85 24" className="h-4 sm:h-5 w-auto overflow-visible pointer-events-none">
              <text
                x="85"
                y="18"
                textAnchor="end"
                fontFamily="Gloock, serif"
                fontSize="18"
                fontWeight="400"
                fill="url(#card-gold-pattern)"
                filter="url(#card-metal-text)"
                letterSpacing="0.03em"
              >
                {config.name}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};
