import { useState, useRef, useEffect } from "react";
import "./App.css";
import mainImage from "./assets/images/mainImg.png";
import weddingRing from "./assets/ico/weddingRing.png";
import map from "./assets/images/map.png";
import kakaoMap from "./assets/ico/kakao.png";
import tMap from "./assets/ico/tmap.png";
import end1 from "./assets/images/end1.jpeg";
import end2 from "./assets/images/end2.jpeg";

// ./assets/images/gallerry 폴더 내 모든 이미지를 자동으로 불러옵니다.
const imageModules = import.meta.glob(
  [
    "./assets/images/gallerry/**/*.{jpeg,jpg,png,webp,JPEG,JPG,PNG,WEBP}",
    "./assets/images/gallery/**/*.{jpeg,jpg,png,webp,JPEG,JPG,PNG,WEBP}",
  ],
  { eager: true, import: "default" },
);

const loadedPhotos = Object.entries(imageModules)
  .sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  )
  .map(([path, url], index) => ({
    id: index + 1,
    image: url,
  }));

const photos =
  loadedPhotos.length > 0 ? loadedPhotos : [{ id: 1, image: mainImage }];

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const center = container.scrollLeft + container.offsetWidth / 2;
    const cards = container.querySelectorAll("[data-card]");
    let closestIndex = 0;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const diff = Math.abs(center - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setCurrentIndex(closestIndex);
  };

  const scrollToSlide = (index) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cards = container.querySelectorAll("[data-card]");
    const target = cards[index];
    if (target) {
      const targetScroll =
        target.offsetLeft - (container.offsetWidth - target.offsetWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const prevSlide = () => {
    scrollToSlide(Math.max(0, currentIndex - 1));
  };

  const nextSlide = () => {
    scrollToSlide(Math.min(photos.length - 1, currentIndex + 1));
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
      e.preventDefault();
    }
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
  const modalTouchStartX = useRef(0);

  const prevFullscreenPhoto = () => {
    if (!fullscreenPhoto?.list || fullscreenPhoto.list.length <= 1) return;
    const newIndex =
      (fullscreenPhoto.index - 1 + fullscreenPhoto.list.length) %
      fullscreenPhoto.list.length;
    setFullscreenPhoto((prev) => ({
      ...prev,
      src: prev.list[newIndex].image,
      alt: `갤러리 사진 ${newIndex + 1}`,
      index: newIndex,
    }));
    scrollToSlide(newIndex);
  };

  const nextFullscreenPhoto = () => {
    if (!fullscreenPhoto?.list || fullscreenPhoto.list.length <= 1) return;
    const newIndex = (fullscreenPhoto.index + 1) % fullscreenPhoto.list.length;
    setFullscreenPhoto((prev) => ({
      ...prev,
      src: prev.list[newIndex].image,
      alt: `갤러리 사진 ${newIndex + 1}`,
      index: newIndex,
    }));
    scrollToSlide(newIndex);
  };

  const handleModalTouchStart = (e) => {
    modalTouchStartX.current = e.touches[0].clientX;
  };

  const handleModalTouchEnd = (e) => {
    if (!fullscreenPhoto?.list || fullscreenPhoto.list.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - modalTouchStartX.current;
    if (diffX > 45) {
      prevFullscreenPhoto();
    } else if (diffX < -45) {
      nextFullscreenPhoto();
    }
  };

  useEffect(() => {
    if (!fullscreenPhoto) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setFullscreenPhoto(null);
      } else if (fullscreenPhoto.list && fullscreenPhoto.list.length > 1) {
        if (e.key === "ArrowLeft") {
          prevFullscreenPhoto();
        } else if (e.key === "ArrowRight") {
          nextFullscreenPhoto();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreenPhoto]);

  const [copied, setCopied] = useState(false);
  const [accountToast, setAccountToast] = useState("");

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("서울 송파구 가락동 양재대로 932");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAccount = (fullText, accountNumber) => {
    navigator.clipboard.writeText(accountNumber || fullText).then(() => {
      setAccountToast("계좌번호가 복사되었습니다.");
      setTimeout(() => setAccountToast(""), 2000);
    });
  };

  const handleTmap = () => {
    const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
    if (!isMobile) {
      alert("모바일에서 확인 부탁드립니다.");
      return;
    }

    const destination = "서울웨딩타워";
    const encoded = encodeURIComponent(destination);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      // Android: Tmap 공식 Intent (앱 설치 시 즉시 실행 및 검색, 미설치 시 플레이스토어 이동)
      window.location.href = `intent://search?name=${encoded}#Intent;scheme=tmap;package=com.skt.tmap.ku;end`;
    } else {
      // iOS: Tmap 검색 스키마 호출 (티맵 앱 실행 및 서울웨딩타워 검색)
      const startTime = Date.now();
      window.location.href = `tmap://search?name=${encoded}`;
      setTimeout(() => {
        // 앱이 열리지 않은 경우 티맵 공식 사이트로 이동 (네이버 검색 연결 제거)
        if (Date.now() - startTime < 2000) {
          window.location.href = "https://www.tmap.co.kr";
        }
      }, 1500);
    }
  };

  const handleKakaoNavi = () => {
    const destination = "서울웨딩타워";
    const encoded = encodeURIComponent(destination);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      // Android: 카카오내비 공식 Intent (앱 설치 시 즉시 실행 및 검색, 미설치 시 플레이스토어 이동)
      window.location.href = `intent://search?name=${encoded}#Intent;scheme=kakaonavi;package=com.locnall.KimGiSa;end`;
    } else {
      // iOS: kakaonavi URL scheme
      const startTime = Date.now();
      window.location.href = `kakaonavi://search?name=${encoded}`;
      setTimeout(() => {
        if (Date.now() - startTime < 2000) {
          window.location.href = `https://map.kakao.com/link/search/${encoded}`;
        }
      }, 1500);
    }
  };
  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center">
      <style></style>

      {/* Mobile-first container */}
      <div className="w-full max-w-[420px] mx-auto bg-[#fcfaf8] min-h-screen shadow-xl relative overflow-hidden flex flex-col font-korean text-[#333]">
        {/* TOP SECTION: Hero Image & Title */}
        <section>
          {/* Mobile-first container */}
          <img
            src={mainImage}
            alt="메인 이미지"
            onClick={() =>
              setFullscreenPhoto({ src: mainImage, alt: "메인 사진" })
            }
            className="w-full h-auto object-cover cursor-pointer hover:opacity-98 transition-opacity"
          />
        </section>

        {/* MIDDLE SECTION: Invitation Message */}
        <section className="mt-8 px-6 py-16 flex flex-col items-center text-center">
          {/* Rings SVG */}
          <div className="w-full flex justify-center mb-2">
            <img
              src={weddingRing}
              alt="웨딩 링"
              className="mx-auto block"
              style={{
                width: "50px",
                height: "auto",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>

          <h2 className="text-[#f54231] font-bold tracking-widest text-sm mb-8 font-elegant">
            INVITATION
          </h2>

          <div className="space-y-6 text-[0.95rem] leading-[1.8] text-gray-800 font-light">
            <p>
              계절의 들녘에 피어나는 꽃처럼
              <br />
              서로의 삶에 따스한 온기가 되어준 두 사람이
              <br />
              이제 한 곳을 바라보며 함께 걸어가려 합니다.
            </p>
            <p>
              함께 웃고, 때로는 서로를 보듬으며
              <br />
              예쁘고 가꾸어진 삶을 만들어가겠습니다.
            </p>
            <p>
              저희가 하나 되는 뜻깊은 날,
              <br />
              고마운 분들과 함께 축복의 시간을 나누고 싶습니다.
            </p>
          </div>

          {/* Divider */}
          <div className="w-6 h-[1px] bg-[#f54231] my-10"></div>

          {/* Parents and Names */}
          <div className="text-[1.05rem] space-y-3 font-medium">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600 font-light text-right">
                최형근 · 한경희의 차남
              </span>
              <span className="font-bold text-lg w-16 text-left">최원호</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600 font-light text-right">
                김응수 · 김경희의 차녀
              </span>
              <span className="font-bold text-lg w-16 text-left">김영주</span>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION: Date & Calendar */}
        <section className="px-6 pb-24 flex flex-col items-center text-center">
          <h2 className="text-[#f54231] font-bold tracking-widest text-sm mb-6 font-elegant">
            DATE
          </h2>

          <div className="mb-10">
            <h3 className="text-3xl tracking-widest font-gowun mb-2 text-gray-900">
              2027.02.20
            </h3>
            <p className="text-[1.05rem] text-gray-700">토요일 낮 1시 40분</p>
          </div>

          {/* Calendar Grid */}
          <div className="w-full max-w-[320px] mx-auto">
            {/* Days Header */}
            <div className="grid grid-cols-7 mb-4 text-xs font-medium text-gray-400">
              <div>일</div>
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div>토</div>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-y-5 text-sm font-gowun text-gray-800 items-center justify-items-center">
              {/* Empty slot for Sunday, Feb 1 2027 is a Monday */}
              <div></div>

              {/* Generating days 1 to 28 */}
              {[...Array(28)].map((_, i) => {
                const day = i + 1;
                const isWeddingDay = day === 20;

                return (
                  <div
                    key={day}
                    className={`w-8 h-8 flex items-center justify-center ${
                      isWeddingDay ? "bg-[#f54231] text-white rounded-full" : ""
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* GALLERY SECTION: Apple-style Swipeable Carousel */}
        <section className="pb-24 flex flex-col items-center text-center">
          <h2 className="text-[#f54231] font-bold tracking-widest text-sm mb-6 font-elegant">
            GALLERY
          </h2>

          {/* Carousel Track Container */}
          <div className="relative w-full overflow-hidden">
            {/* Left Navigation Arrow Button (Apple Style) */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={prevSlide}
                aria-label="이전 사진"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-lg border border-black/5 flex items-center justify-center text-gray-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            {/* Right Navigation Arrow Button (Apple Style) */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={nextSlide}
                aria-label="다음 사진"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-lg border border-black/5 flex items-center justify-center text-gray-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}

            {/* Scrollable Track (Touch swipe & Mouse drag) */}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-3 no-scrollbar cursor-grab active:cursor-grabbing select-none"
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                paddingLeft: "calc(50% - 135px)",
                paddingRight: "calc(50% - 135px)",
              }}
            >
              {photos.map((item, index) => (
                <div
                  key={item.id}
                  data-card
                  onClick={() => {
                    if (!hasDraggedRef.current) {
                      scrollToSlide(index);
                      setFullscreenPhoto({
                        src: item.image,
                        alt: `갤러리 사진 ${index + 1}`,
                        list: photos,
                        index: index,
                      });
                    }
                  }}
                  className="snap-center shrink-0 w-[270px] h-[360px] bg-white overflow-hidden border border-gray-100/80 relative transition-transform duration-200 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={`갤러리 사진 ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCATION SECTION: Map & Directions */}
        <section className="px-6 pb-24 flex flex-col items-center text-center">
          {/* Section Header */}
          <h2 className="text-[#f54231] font-bold tracking-widest text-sm mb-6 font-elegant">
            LOCATION
          </h2>

          {/* Venue Name & Address */}
          <div className="mb-6">
            <h3 className="text-[1.15rem] font-bold text-gray-900 mb-1.5 font-gowun">
              서울웨딩타워 (SAFE 타워 업무동 2층)
            </h3>
            <div className="flex items-center justify-center gap-2 text-[0.95rem] text-gray-600 font-gowun">
              <span>서울 송파구 가락동 양재대로 932</span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-xs text-[#f54231] border border-[#f54231]/40 rounded-md px-2 py-0.5 hover:bg-[#f54231]/5 transition-colors cursor-pointer"
              >
                {copied ? "복사완료!" : "복사"}
              </button>
            </div>
          </div>

          {/* Navigation Buttons: Tmap & KakaoNavi */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-[340px] mb-8">
            {/* Tmap Button */}
            <button
              type="button"
              onClick={handleTmap}
              className="bg-white border border-gray-200/90 py-3 px-4 flex items-center justify-center gap-2.5  hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              {/* Tmap Logo Icon */}
              <img
                src={tMap}
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              />

              <span className="font-bold text-gray-800 text-sm font-gowun">
                T맵
              </span>
            </button>

            {/* KakaoNavi Button */}
            <button
              type="button"
              onClick={handleKakaoNavi}
              className="bg-white border border-gray-200/90 py-3 px-4 flex items-center justify-center gap-2.5  hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              {/* KakaoNavi Logo Icon */}
              <img
                src={kakaoMap}
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              />
              <span className="font-bold text-gray-800 text-sm font-gowun">
                카카오내비
              </span>
            </button>
          </div>

          {/* Map Graphic Image */}
          <div className="w-full max-w-[360px] mb-8 overflow-hidden rounded-2xl">
            <img
              src={map}
              alt="서울웨딩타워 약도"
              onClick={() =>
                setFullscreenPhoto({ src: map, alt: "서울웨딩타워 약도" })
              }
              className="w-full h-auto object-contain mx-auto cursor-pointer hover:opacity-95 transition-opacity"
            />
          </div>

          {/* Transit Directions */}
          <div className="w-full max-w-[360px] space-y-6 text-left font-gowun">
            {/* 지하철 이용 시 */}
            <div>
              <h4 className="font-bold text-gray-900 text-[1.05rem] mb-2 font-gowun">
                지하철 이용 시
              </h4>
              <ul className="space-y-1.5 text-[0.92rem] text-gray-700 leading-relaxed font-light">
                <li className="flex items-start gap-1.5">
                  <span className="text-gray-400">·</span>
                  <span>3호선, 8호선 가락시장역 2번 출구 도보 5분</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-gray-400">·</span>
                  <span>SRT 수서역/고속터미널/남부터미널에서 3호선 환승</span>
                </li>
              </ul>
            </div>

            {/* 버스 이용 시 */}
            <div>
              <h4 className="font-bold text-gray-900 text-[1.05rem] mb-2 font-gowun">
                버스 이용 시
              </h4>
              <ul className="space-y-1.5 text-[0.92rem] text-gray-700 leading-relaxed font-light">
                <li className="flex items-start gap-1.5">
                  <span className="text-gray-400">·</span>
                  <span>가락시장, 가락시장역, 가락몰 정류장 하차</span>
                </li>
              </ul>
            </div>

            {/* 자가용 이용 시 */}
            <div>
              <h4 className="font-bold text-gray-900 text-[1.05rem] mb-2 font-gowun">
                자가용 이용 시
              </h4>
              <ul className="space-y-1.5 text-[0.92rem] text-gray-700 leading-relaxed font-light">
                <li className="flex items-start gap-1.5">
                  <span className="text-gray-400">·</span>
                  <span>동문지하주차장 지하 3층 S구역 이용</span>
                </li>
                <li className="pl-3.5 text-gray-600">
                  주차 총 2000대 가능, 3시간 무료 이후 10분당 500원
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CLOSING & ACCOUNT SECTION: 마음 전하실 곳 */}
        <section className="px-6 pb-28 flex flex-col items-center text-center">
          <h2 className="text-[#f54231] font-bold tracking-widest text-sm mb-6 font-elegant">
            ACCOUNT
          </h2>

          {/* Top Message */}
          <div className="space-y-1.5 text-[0.95rem] leading-[1.8] text-gray-800 font-gowun mb-8">
            <p>
              부득이하게 참석이 어려우신 분들을 위해
              <br />
              계좌번호를 기재하였습니다.
            </p>
            <p>축복해 주신 마음 오래도록 간직하겠습니다.</p>
          </div>

          {/* Groom & Bride Couple Photos */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-[360px] mb-12">
            <div
              onClick={() =>
                setFullscreenPhoto({ src: end2, alt: "신랑 최원호" })
              }
              className="aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
            >
              <img
                src={end2}
                alt="신랑 최원호"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={() =>
                setFullscreenPhoto({ src: end1, alt: "신부 김영주" })
              }
              className="aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
            >
              <img
                src={end1}
                alt="신부 김영주"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Account Numbers */}
          <div className="w-full max-w-[360px] space-y-9 font-gowun text-center">
            {/* 신랑측 */}
            <div>
              <h4 className="text-[1.05rem] font-bold text-gray-900 mb-3.5">
                신랑측
              </h4>
              <div className="space-y-2.5 text-[0.95rem] text-gray-800">
                {/* 신한은행 최원호 */}
                <div
                  onClick={() =>
                    handleCopyAccount(
                      "신한은행 110-395-333499 최원호",
                      "110-395-333499",
                    )
                  }
                  className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-black transition-colors py-1"
                >
                  <span>신한은행 110-395-333499 최원호</span>
                  <button
                    type="button"
                    aria-label="계좌번호 복사"
                    className="p-1 text-gray-600 hover:text-black cursor-pointer"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>

                {/* SC제일은행 한경희 */}
                <div
                  onClick={() =>
                    handleCopyAccount(
                      "SC제일은행 643-20-049760 한경희",
                      "643-20-049760",
                    )
                  }
                  className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-black transition-colors py-1"
                >
                  <span>SC제일은행 643-20-049760 한경희</span>
                  <button
                    type="button"
                    aria-label="계좌번호 복사"
                    className="p-1 text-gray-600 hover:text-black cursor-pointer"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 신부측 */}
            <div>
              <h4 className="text-[1.05rem] font-bold text-gray-900 mb-3.5">
                신부측
              </h4>
              <div className="space-y-2.5 text-[0.95rem] text-gray-800">
                {/* 국민은행 김영주 */}
                <div
                  onClick={() =>
                    handleCopyAccount(
                      "국민은행 166101-04-159887 김영주",
                      "166101-04-159887",
                    )
                  }
                  className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-black transition-colors py-1"
                >
                  <span>국민은행 166101-04-159887 김영주</span>
                  <button
                    type="button"
                    aria-label="계좌번호 복사"
                    className="p-1 text-gray-600 hover:text-black cursor-pointer"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>

                {/* 농협은행 김응수 */}
                <div
                  onClick={() =>
                    handleCopyAccount(
                      "농협은행 352-0525-0798-03 김응수",
                      "352-0525-0798-03",
                    )
                  }
                  className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-black transition-colors py-1"
                >
                  <span>농협은행 352-0525-0798-03 김응수</span>
                  <button
                    type="button"
                    aria-label="계좌번호 복사"
                    className="p-1 text-gray-600 hover:text-black cursor-pointer"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Toast Notification for Account Copy */}
        {accountToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm font-gowun pointer-events-none transition-opacity">
            {accountToast}
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {fullscreenPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center select-none"
          onClick={() => setFullscreenPhoto(null)}
          onTouchStart={handleModalTouchStart}
          onTouchEnd={handleModalTouchEnd}
        >
          {/* 왼쪽 상단 사진 순서 표시 (갤러리 사진일 때) */}
          {fullscreenPhoto.list && fullscreenPhoto.list.length > 1 && (
            <div className="absolute top-6 left-6 z-50 text-white/90 font-gowun text-sm bg-black/50 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              {fullscreenPhoto.index + 1} / {fullscreenPhoto.list.length}
            </div>
          )}

          {/* 오른쪽 상단 X 닫기 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenPhoto(null);
            }}
            aria-label="닫기"
            className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 shadow-lg active:scale-95"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* 이전 사진 버튼 (갤러리 사진일 때) */}
          {fullscreenPhoto.list && fullscreenPhoto.list.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevFullscreenPhoto();
              }}
              aria-label="이전 사진"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/15 shadow-md"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          {/* 다음 사진 버튼 (갤러리 사진일 때) */}
          {fullscreenPhoto.list && fullscreenPhoto.list.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextFullscreenPhoto();
              }}
              aria-label="다음 사진"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/15 shadow-md"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}

          {/* 중앙 전체화면 사진 */}
          <div
            className="w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenPhoto.src}
              alt={fullscreenPhoto.alt || "전체화면 사진"}
              className="max-w-full max-h-[90vh] object-contain shadow-2xl transition-all select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
