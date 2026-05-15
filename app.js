const app = document.getElementById("app");
const RESULT_STATE_KEY = "homeSafetyGameResultState";

let currentScreen = "main";
let selectedHouse = null;
let selectedHouseCategory = null;
let currentStageIndex = 0;
let foundItems = [];
let totalFoundCount = 0;
let wrongTryCount = 0;
let gameAbandoned = false;
const preloadedImages = new Set();

const houseTypes = [
  {
    id: "apt-corridor",
    kind: "apartment",
    title: "복도식 아파트",
    desc: "긴 복도와 여러 세대 현관이 보이는 구조",
    image: "assets/images/apartment-1.webp"
  },
  {
    id: "apt-elevator",
    kind: "apartment",
    title: "엘리베이터 앞 현관형",
    desc: "엘리베이터에서 바로 세대 현관으로 이동하는 구조",
    image: "assets/images/apartment-2.webp"
  },
  {
    id: "apt-new",
    kind: "apartment",
    title: "신축 아파트",
    desc: "밝고 넓은 공동현관과 자동문이 있는 구조",
    image: "assets/images/apartment-3.webp"
  },
  {
    id: "apt-old",
    kind: "apartment",
    title: "구축 아파트",
    desc: "낡은 신발장과 좁은 세대 현관이 많은 구조",
    image: "assets/images/apartment-4.webp"
  },
  {
    id: "house-detached",
    kind: "house",
    title: "단독주택",
    desc: "대문과 짧은 진입로, 현관 앞 계단이 있는 구조",
    image: "assets/images/house-1.webp"
  },
  {
    id: "house-villa",
    kind: "house",
    title: "다세대·빌라",
    desc: "공동현관과 짧은 계단, 좁은 접근로가 있는 구조",
    image: "assets/images/house-2.webp"
  }
];

const stages = [
  {
    id: "home-entry",
    title: "우리집 입구",
    beforeImageByKind: {
      apartment: "assets/images/apartment-entry-before.webp",
      house: "assets/images/house-entry-before.webp"
    },
    afterImageByKind: {
      apartment: "assets/images/apartment-entry-after.webp",
      house: "assets/images/house-entry-after.webp"
    },
    beforeImageByHouse: {
      "apt-corridor": "assets/images/apt-corridor-entry-before.webp",
      "apt-elevator": "assets/images/apt-elevator-entry-before.webp",
      "apt-new": "assets/images/apt-new-entry-before.webp",
      "apt-old": "assets/images/apt-old-entry-before.webp"
    },
    afterImageByHouse: {
      "apt-corridor": "assets/images/apt-corridor-entry-after.webp",
      "apt-elevator": "assets/images/apt-elevator-entry-after.webp",
      "apt-new": "assets/images/apt-new-entry-after.webp",
      "apt-old": "assets/images/apt-old-entry-after.webp"
    },
    mission: "밖에서 집으로 들어올 때 계단, 조명, 접근로가 안전한지 확인해요.",
    activity: "이동하기",
    otPoint: "출입구는 낙상이 시작되기 쉬운 지점입니다. 계단 끝선, 손잡이, 경사로, 조명은 보행 안정성을 높이는 핵심 환경수정입니다.",
    items: [
      {
        id: "light",
        label: "어두운 출입구 조명을 찾아보세요",
        labelByHouse: {
          "apt-new": "유리문과 바닥이 잘 구분되지 않는 출입구를 찾아보세요"
        },
        afterText: "공동현관 천장등과 센서등을 보강해 계단과 출입문 주변이 잘 보이게 했어요.",
        afterTextByHouse: {
          "apt-elevator": "엘리베이터 홀까지 이어지는 출입문 주변 조명과 문틀 시인성을 보강했어요.",
          "apt-new": "유리문 안전 표시와 바닥 조명으로 출입문 위치가 잘 보이게 했어요."
        },
        feedback: "어두우면 계단 높이와 문턱을 놓치기 쉬워요.",
        feedbackByHouse: {
          "apt-new": "신축 출입구는 깔끔해도 유리문과 바닥 경계가 잘 안 보일 수 있어요."
        },
        afterTextByKind: {
          house: "센서등과 풋라이트로 입구와 계단이 잘 보이게 했어요."
        },
        x: 41,
        y: 23,
        radius: 11,
        xByHouse: {
          "apt-corridor": 41,
          "apt-elevator": 41,
          "apt-new": 30,
          "apt-old": 41
        },
        yByHouse: {
          "apt-corridor": 21,
          "apt-elevator": 19,
          "apt-new": 22,
          "apt-old": 22
        },
        xByKind: { house: 55 },
        yByKind: { house: 24 }
      },
      {
        id: "mat-edge",
        label: "경사로와 손잡이 없이 계단만 있는 출입구를 찾아보세요",
        labelByKind: {
          house: "현관 앞 계단과 단차를 찾아보세요"
        },
        labelByHouse: {
          "apt-elevator": "출입문 앞 문턱과 좁은 대기공간을 찾아보세요",
          "apt-new": "미끄럽고 반사되는 출입구 바닥을 찾아보세요"
        },
        afterText: "계단 옆에 완만한 경사로와 연속 손잡이를 설치해 보행 보조기나 유모차도 접근하기 쉽게 했어요.",
        afterTextByHouse: {
          "apt-elevator": "문턱을 잘 보이게 표시하고 출입문 앞 대기공간과 지지 손잡이를 확보했어요.",
          "apt-new": "출입구 바닥에 미끄럼방지 처리를 하고 평탄한 접근로를 명확히 했어요."
        },
        feedback: "손잡이와 경사로는 균형을 잡고 천천히 이동하도록 도와줘요.",
        feedbackByHouse: {
          "apt-elevator": "엘리베이터 앞은 방향을 바꾸고 기다리는 공간이 필요해요.",
          "apt-new": "반사되는 바닥은 젖었을 때 미끄럼 위험을 알아차리기 어려워요."
        },
        afterTextByKind: {
          house: "경사판이나 손잡이, 조명으로 오르내리기 쉽게 했어요."
        },
        x: 50,
        y: 71,
        radius: 15,
        xByHouse: {
          "apt-corridor": 38,
          "apt-elevator": 50,
          "apt-new": 50,
          "apt-old": 48
        },
        yByHouse: {
          "apt-corridor": 64,
          "apt-elevator": 64,
          "apt-new": 70,
          "apt-old": 64
        },
        radiusByHouse: {
          "apt-corridor": 13,
          "apt-elevator": 11,
          "apt-new": 12,
          "apt-old": 13
        },
        xByKind: { house: 52 },
        yByKind: { house: 70 },
        radiusByKind: { house: 9 }
      },
      {
        id: "clutter",
        label: "계단 끝선이 잘 보이지 않는 부분을 찾아보세요",
        labelByKind: {
          house: "이동을 방해하는 물건을 찾아보세요"
        },
        labelByHouse: {
          "apt-elevator": "출입문 바닥 경계가 잘 보이지 않는 부분을 찾아보세요",
          "apt-new": "점자블록이나 안내 경로가 부족한 부분을 찾아보세요"
        },
        afterText: "계단 끝에 노란 미끄럼방지 표시를 붙여 발을 디딜 위치를 쉽게 확인하게 했어요.",
        afterTextByHouse: {
          "apt-elevator": "출입문 바닥 경계와 문턱을 고대비 표시로 알아보기 쉽게 했어요.",
          "apt-new": "점자블록과 안내 경로, 고대비 표시를 더해 출입 방향을 쉽게 알 수 있게 했어요."
        },
        feedback: "계단 끝선이 잘 보여야 발을 헛디딜 위험이 줄어요.",
        feedbackByHouse: {
          "apt-elevator": "바닥 경계가 흐리면 발을 끌거나 보행 보조기를 사용할 때 걸릴 수 있어요.",
          "apt-new": "넓고 깨끗한 공간도 안내 경로가 없으면 방향 찾기가 어려울 수 있어요."
        },
        afterTextByKind: {
          house: "신발, 우산, 택배상자를 정리하고 긴 구두주걱과 집게를 세워 허리 굽힘을 줄였어요."
        },
        x: 53,
        y: 82,
        radius: 12,
        xByHouse: {
          "apt-corridor": 52,
          "apt-elevator": 56,
          "apt-new": 52,
          "apt-old": 54
        },
        yByHouse: {
          "apt-corridor": 82,
          "apt-elevator": 82,
          "apt-new": 84,
          "apt-old": 80
        },
        radiusByHouse: {
          "apt-corridor": 10,
          "apt-elevator": 10,
          "apt-new": 10,
          "apt-old": 10
        },
        xByKind: { house: 24 },
        yByKind: { house: 78 },
        radiusByKind: { house: 11 }
      }
    ]
  },
  {
    id: "hallway",
    title: "현관",
    beforeImage: "assets/images/entrance-before.webp",
    afterImage: "assets/images/entrance-after.webp",
    mission: "신발을 신고 벗고, 집 안으로 들어오는 동작이 편한지 확인해요.",
    activity: "신발 신기",
    otPoint: "현관은 허리 굽힘, 한발 서기, 단차 이동이 함께 일어나는 공간입니다. 앉을 곳과 잡을 곳, 긴 보조도구를 함께 배치하는 것이 좋습니다.",
    items: [
      {
        id: "shoes",
        label: "현관 통로를 막는 신발과 물건을 찾아보세요",
        afterText: "신발을 정리하고 긴 구두주걱과 집게로 허리 굽힘을 줄였어요.",
        feedback: "통로가 막히면 물건을 든 상태에서 균형을 잃기 쉬워요.",
        x: 23,
        y: 82,
        radius: 11
      },
      {
        id: "floor",
        label: "실내로 올라가는 현관 단차를 찾아보세요",
        afterText: "현관 의자와 안전손잡이로 단차를 오르내릴 때 지지할 수 있게 했어요.",
        feedback: "단차는 한쪽 다리에 체중이 몰리는 순간을 만들어요.",
        x: 52,
        y: 64,
        radius: 9
      },
      {
        id: "handle",
        label: "신발을 신을 때 잡거나 앉을 곳이 없는 부분을 찾아보세요",
        afterText: "안전손잡이, 현관 의자, 긴 구두주걱과 집게를 배치했어요.",
        feedback: "앉아서 신발을 신으면 허리와 균형 부담이 줄어요.",
        x: 82,
        y: 30,
        radius: 11
      }
    ]
  },
  {
    id: "living",
    title: "거실",
    beforeImage: "assets/images/living-before.webp",
    afterImage: "assets/images/living-after.webp",
    hint: "채광, 소파, 전선과 바닥을 살펴보세요.",
    mission: "거실에서 걷고 앉고 일어나는 동작이 안전한지 확인해요.",
    activity: "앉고 일어서기",
    otPoint: "거실은 가장 오래 머무는 생활공간입니다. 동선, 좌석 높이, 조명, 전선 정리는 반복적인 이동과 앉고 일어서기를 안전하게 만듭니다.",
    items: [
      {
        id: "wire",
        label: "걸려 넘어질 수 있는 전선을 찾아보세요",
        afterText: "전선을 정리해 낙상 위험을 줄였어요.",
        feedback: "전선은 발끝에 걸리는 대표적인 낙상 위험이에요.",
        x: 46,
        y: 78,
        radius: 13
      },
      {
        id: "sofa",
        label: "일어나기 어려운 낮은 소파를 찾아보세요",
        afterText: "팔걸이와 적정 높이가 있는 좌석으로 일어나기 쉽게 했어요.",
        feedback: "너무 낮은 의자는 무릎과 허리에 부담을 줘요.",
        x: 82,
        y: 58,
        radius: 13
      },
      {
        id: "light",
        label: "어두운 공간을 찾아보세요",
        afterText: "채광과 조명을 개선했어요.",
        feedback: "밝은 조명은 장애물과 바닥 변화를 빨리 보게 해줘요.",
        x: 9,
        y: 32,
        radius: 12
      }
    ]
  },
  {
    id: "kitchen",
    title: "주방",
    beforeImage: "assets/images/kitchen-before.webp",
    afterImage: "assets/images/kitchen-after.webp",
    hint: "불, 바닥, 높은 수납공간을 살펴보세요.",
    mission: "요리하고 설거지하고 물건을 꺼내는 동작이 안전한지 확인해요.",
    activity: "요리하기",
    otPoint: "주방은 불, 물, 높은 수납이 함께 있는 공간입니다. 자주 쓰는 물건을 손이 닿는 높이에 두고, 바닥 미끄럼과 가스 안전을 함께 봐야 합니다.",
    items: [
      {
        id: "gas",
        label: "화재 위험이 있는 가스레인지를 찾아보세요",
        afterText: "가스 안전 타이머와 자동 차단 장치를 설치했어요.",
        feedback: "타이머와 차단 장치는 깜빡했을 때의 위험을 줄여줘요.",
        x: 47,
        y: 49,
        radius: 9
      },
      {
        id: "mat",
        label: "미끄러운 바닥을 찾아보세요",
        afterText: "싱크대 앞에 미끄럼방지 매트를 설치했어요.",
        feedback: "물기가 생기는 곳은 서서 일하는 시간이 길어 더 조심해야 해요.",
        x: 36,
        y: 86,
        radius: 11
      },
      {
        id: "storage",
        label: "손이 닿기 어려운 수납공간을 찾아보세요",
        afterText: "자주 쓰는 그릇과 냄비를 허리~가슴 높이 선반으로 옮겼어요.",
        feedback: "높은 수납은 까치발과 어깨 부담을 만들 수 있어요.",
        x: 78,
        y: 19,
        radius: 10
      }
    ]
  },
  {
    id: "bedroom",
    title: "침실",
    beforeImage: "assets/images/bedroom-before.webp",
    afterImage: "assets/images/bedroom-after.webp",
    hint: "침대, 조명, 이동 동선을 살펴보세요.",
    mission: "밤에 침대에서 일어나 화장실까지 이동하는 과정을 확인해요.",
    activity: "잠자리 이동",
    otPoint: "침실은 야간 이동과 기상 동작이 중요합니다. 침대 옆 지지대, 손이 닿는 조명, 발밑 조명은 밤 시간 낙상을 줄이는 데 도움이 됩니다.",
    items: [
      {
        id: "bedrail",
        label: "침대 옆 지지대가 없는 부분을 찾아보세요",
        afterText: "침대 안전바를 설치했어요.",
        feedback: "침대에서 일어날 때 잡을 곳이 있으면 몸을 안정시키기 쉬워요.",
        x: 61,
        y: 61,
        radius: 11
      },
      {
        id: "nightlight",
        label: "밤에 어두운 이동 경로를 찾아보세요",
        afterText: "화장실 이동 경로에 풋라이트와 센서등을 설치했어요.",
        feedback: "야간 조명은 잠에서 깬 직후 방향을 잡는 데 도움이 돼요.",
        x: 13,
        y: 58,
        radius: 12
      },
      {
        id: "remote",
        label: "손이 닿기 어려운 스위치를 찾아보세요",
        afterText: "침대 옆에 리모컨형 조명 버튼을 배치했어요.",
        feedback: "손 닿는 곳의 스위치는 무리한 몸 돌림을 줄여줘요.",
        x: 95,
        y: 35,
        radius: 7
      }
    ]
  },
  {
    id: "bathroom",
    title: "욕실",
    beforeImage: "assets/images/bathroom-before.webp",
    afterImage: "assets/images/bathroom-after.webp",
    hint: "손잡이, 바닥, 목욕의자를 살펴보세요.",
    mission: "씻기, 앉고 일어서기, 방향 바꾸기가 안전한지 확인해요.",
    activity: "씻기",
    otPoint: "욕실은 미끄럼과 방향 전환이 많은 고위험 공간입니다. 손잡이, 목욕의자, 미끄럼방지 바닥은 씻기 활동을 더 안정적으로 만듭니다.",
    items: [
      {
        id: "grabbar",
        label: "안전 손잡이가 없는 부분을 찾아보세요",
        afterText: "욕실 안전 손잡이를 설치했어요.",
        feedback: "손잡이는 앉고 일어서거나 방향을 바꿀 때 몸을 지지해줘요.",
        x: 82,
        y: 45,
        radius: 11
      },
      {
        id: "floor",
        label: "미끄러운 바닥을 찾아보세요",
        afterText: "미끄럼 방지 바닥재를 적용했어요.",
        feedback: "젖은 바닥은 작은 움직임에도 발이 밀릴 수 있어요.",
        x: 43,
        y: 73,
        radius: 12
      },
      {
        id: "chair",
        label: "앉아서 씻을 수 없는 공간을 찾아보세요",
        afterText: "목욕의자를 배치해 안전하게 씻을 수 있어요.",
        feedback: "앉아서 씻으면 피로와 균형 부담을 줄일 수 있어요.",
        x: 17,
        y: 58,
        radius: 11
      }
    ]
  }
];

function safePlay(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    let frequency = 360;
    let duration = 0.13;

    if (type === "correct") {
      frequency = 660;
      duration = 0.14;
    }

    if (type === "wrong") {
      frequency = 150;
      duration = 0.16;
    }

    if (type === "clear") {
      frequency = 880;
      duration = 0.28;
    }

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    if (type === "clear") {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(990, now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (error) {
    // 브라우저 자동재생 정책 또는 오디오 미지원 환경에서는 조용히 무시합니다.
  }
}

function render() {
  if (currentScreen === "main") renderMain();
  if (currentScreen === "guide") renderGuide();
  if (currentScreen === "houseSelect") renderHouseSelect();
  if (currentScreen === "stage") renderStage();
  if (currentScreen === "afterView") renderAfterView();
  if (currentScreen === "result") renderResult();
}

function fallbackImage(image) {
  if (!image) return;

  const currentSrc = image.getAttribute("src");
  if (currentSrc.endsWith(".webp")) {
    image.src = currentSrc.replace(".webp", ".png");
    return;
  }

  if (currentSrc.endsWith(".png")) {
    image.src = currentSrc.replace(".png", ".svg");
    return;
  }

  image.onerror = null;
}

function preloadImage(src) {
  if (!src || preloadedImages.has(src)) return;

  preloadedImages.add(src);
  const image = new Image();
  image.src = src;
}

function preloadHouseImages() {
  houseTypes.forEach(house => preloadImage(house.image));
}

function preloadStageImages(startIndex = 0, count = 2) {
  stages.slice(startIndex, startIndex + count).forEach(stage => {
    preloadImage(getStageBeforeImage(stage));
    preloadImage(getStageAfterImage(stage));
  });
}

function getSelectedHouse() {
  return houseTypes.find(item => item.id === selectedHouse);
}

function getSelectedHouseKind() {
  return getSelectedHouse()?.kind || "apartment";
}

function getStageBeforeImage(stage) {
  if (stage.beforeImageByHouse && selectedHouse) {
    return stage.beforeImageByHouse[selectedHouse] || stage.beforeImageByKind?.[getSelectedHouseKind()] || stage.beforeImage;
  }

  if (stage.beforeImageByKind) {
    return stage.beforeImageByKind[getSelectedHouseKind()] || stage.beforeImageByKind.apartment;
  }

  return stage.beforeImage;
}

function getStageAfterImage(stage) {
  if (stage.afterImageByHouse && selectedHouse) {
    return stage.afterImageByHouse[selectedHouse] || stage.afterImageByKind?.[getSelectedHouseKind()] || stage.afterImage;
  }

  if (stage.afterImageByKind) {
    return stage.afterImageByKind[getSelectedHouseKind()] || stage.afterImageByKind.apartment;
  }

  return stage.afterImage;
}

function getItemValue(item, key) {
  const valueByHouse = item[`${key}ByHouse`];
  if (valueByHouse && selectedHouse) {
    return valueByHouse[selectedHouse] ?? valueByHouse.apartment ?? item[key];
  }

  const valueByKind = item[`${key}ByKind`];
  if (valueByKind) {
    return valueByKind[getSelectedHouseKind()] ?? valueByKind.apartment ?? item[key];
  }

  return item[key];
}

function getItemLabel(item) {
  return getItemValue(item, "label");
}

function getItemAfterText(item) {
  return getItemValue(item, "afterText");
}

function getItemFeedback(item) {
  return getItemValue(item, "feedback") || getItemAfterText(item);
}

function getItemPoint(item) {
  return {
    x: getItemValue(item, "x"),
    y: getItemValue(item, "y"),
    radius: getItemValue(item, "radius")
  };
}

function renderBackButton() {
  if (currentScreen === "main") return "";

  return `
    <button class="back-btn" onclick="goBack()" aria-label="이전 화면으로 돌아가기">
      <span aria-hidden="true">‹</span>
      뒤로
    </button>
  `;
}

function syncProgressCount() {
  totalFoundCount = currentStageIndex * 3 + foundItems.length;
}

function goBack() {
  if (currentScreen === "guide") {
    currentScreen = "main";
  } else if (currentScreen === "houseSelect") {
    if (selectedHouseCategory) {
      selectedHouseCategory = null;
      selectedHouse = null;
    } else {
      currentScreen = "guide";
    }
  } else if (currentScreen === "stage") {
    if (currentStageIndex === 0) {
      foundItems = [];
      currentScreen = "houseSelect";
    } else {
      currentStageIndex -= 1;
      foundItems = [];
    }
    syncProgressCount();
  } else if (currentScreen === "afterView") {
    currentScreen = "stage";
    syncProgressCount();
  } else if (currentScreen === "result") {
    currentStageIndex = stages.length - 1;
    foundItems = stages[currentStageIndex].items.map(item => item.id);
    syncProgressCount();
    currentScreen = "afterView";
  }

  render();
}

function renderMain() {
  app.innerHTML = `
    <section class="screen main-screen">
      <div class="main-content">
        <div class="game-kicker">작업치료 주거환경 개선 게임</div>
        <h1 class="game-title">우리집<br>안전점검</h1>
        <button class="primary-btn main-start-btn" onclick="goToGuide()">시작하기</button>
      </div>
    </section>
  `;
  preloadHouseImages();
  preloadStageImages(0, 1);
}

function goToGuide() {
  currentScreen = "guide";
  render();
}

function renderGuide() {
  app.innerHTML = `
    <section class="screen guide-screen">
      ${renderBackButton()}
      <div class="panel guide-panel">
        <h2>게임방법</h2>
        <p>작업치료 관점에서 어르신의 일상생활을 방해하는 환경을 찾아보세요. 정답을 모두 찾으면 활동을 더 안전하고 편하게 만드는 개선 후 모습을 확인할 수 있어요.</p>

        <div class="ot-lens" aria-label="작업치료 관점">
          <div class="ot-lens-card">
            <strong>사람</strong>
            <span>균형, 근력, 시야, 허리 굽힘 부담</span>
          </div>
          <div class="ot-lens-card">
            <strong>활동</strong>
            <span>이동하기, 씻기, 요리하기, 신발 신기</span>
          </div>
          <div class="ot-lens-card">
            <strong>환경</strong>
            <span>단차, 조명, 손잡이, 미끄럼, 수납 위치</span>
          </div>
        </div>

        <div class="flow" aria-label="게임 진행 흐름">
          <div class="flow-step"><span class="flow-number">1</span><span>우리집 유형 선택</span></div>
          <div class="flow-step"><span class="flow-number">2</span><span>일상생활을 방해하는 위험요소 찾기</span></div>
          <div class="flow-step"><span class="flow-number">3</span><span>환경수정과 보조도구 적용 확인</span></div>
          <div class="flow-step"><span class="flow-number">4</span><span>다음 공간으로 이동</span></div>
        </div>

        <button class="primary-btn" onclick="goToHouseSelect()">시작하기</button>
      </div>
    </section>
  `;
}

function goToHouseSelect() {
  currentScreen = "houseSelect";
  selectedHouseCategory = null;
  selectedHouse = null;
  render();
}

function renderHouseSelect() {
  if (!selectedHouseCategory) {
    app.innerHTML = `
      <section class="screen house-select-screen">
        ${renderBackButton()}
        <div class="house-header compact">
          <h2>우리집은 어떤 유형인가요?</h2>
          <p>먼저 큰 유형을 고르면, 다음 화면에서 출입구 구조를 선택합니다.</p>
        </div>
        <div class="category-grid">
          <button class="category-card" onclick="selectHouseCategory('apartment')">
            <img src="assets/images/apartment-4.webp" alt="아파트" onerror="fallbackImage(this)">
            <span>아파트</span>
            <small>복도식, 엘리베이터형, 신축, 구축</small>
          </button>
          <button class="category-card" onclick="selectHouseCategory('house')">
            <img src="assets/images/house-1.webp" alt="주택" onerror="fallbackImage(this)">
            <span>주택</span>
            <small>단독주택, 다세대·빌라</small>
          </button>
        </div>
      </section>
    `;
    return;
  }

  const cards = houseTypes
    .filter(house => house.kind === selectedHouseCategory)
    .map(house => `
    <button class="house-card ${selectedHouse === house.id ? "selected" : ""}" onclick="selectHouse('${house.id}')">
      <img src="${house.image}" alt="${house.title}" onerror="fallbackImage(this)">
      <div class="house-card-title">${house.title}</div>
      <div class="house-card-desc">${house.desc}</div>
    </button>
  `).join("");

  app.innerHTML = `
    <section class="screen house-select-screen">
      ${renderBackButton()}
      <div class="house-header compact">
        <h2>${selectedHouseCategory === "apartment" ? "아파트 출입구 구조 선택" : "주택 출입구 구조 선택"}</h2>
        <p>가장 비슷한 구조를 고르면 해당 출입구 이미지로 시작합니다.</p>
      </div>
      <div class="card-grid">
        ${cards}
      </div>
      <div class="house-actions">
        <button class="primary-btn" onclick="startGame()">선택 완료</button>
      </div>
    </section>
  `;
}

function selectHouseCategory(category) {
  selectedHouseCategory = category;
  selectedHouse = null;
  renderHouseSelect();
}

function selectHouse(id) {
  selectedHouse = id;
  renderHouseSelect();
}

function startGame() {
  if (!selectedHouse) {
    alert("우리집과 비슷한 구조를 먼저 선택해주세요.");
    return;
  }

  currentStageIndex = 0;
  foundItems = [];
  totalFoundCount = 0;
  wrongTryCount = 0;
  gameAbandoned = false;
  currentScreen = "stage";
  render();
}

function renderStage() {
  const stage = stages[currentStageIndex];
  const beforeImage = getStageBeforeImage(stage);
  preloadStageImages(currentStageIndex, 2);

  const checklist = stage.items.map(item => {
    const isDone = foundItems.includes(item.id);
    return `
      <div class="check-item ${isDone ? "done" : ""}">
        <span>${isDone ? "☑" : "□"}</span>
        <span>${getItemLabel(item)}</span>
      </div>
    `;
  }).join("");
  const canMoveForward = foundItems.length >= stage.items.length;

  app.innerHTML = `
    <section class="screen stage-screen">
      ${renderBackButton()}
      <div class="stage-header">
        <div>
          <div class="stage-title">${stage.title}</div>
          <div class="stage-subtitle">${getSelectedHouseTitle()} 일상생활 환경평가</div>
        </div>
        <div class="stage-actions">
          <div class="stage-progress">공간 ${currentStageIndex + 1} / ${stages.length}</div>
          <button class="quit-btn" onclick="quitGame()">점검 종료</button>
        </div>
      </div>

      <div class="mission-card">
        <div class="mission-badge">${stage.activity}</div>
        <div>
          <strong>${stage.title} 미션</strong>
          <span>${stage.mission}</span>
        </div>
      </div>

      <div class="stage-layout">
        <div class="image-area" id="imageArea" onclick="handleImageClick(event)">
          <img class="stage-image" id="stageImage" src="${beforeImage}" alt="${stage.title} 개선 전 이미지" onerror="fallbackImage(this)">
          ${renderAnswerRings(stage)}
        </div>

        <aside class="side-panel">
          <div class="checklist-title">작업치료 점검 항목</div>
          <div class="score-row">
            <span>발견 ${foundItems.length} / ${stage.items.length}</span>
            <span>전체 ${totalFoundCount} / ${getTotalItemCount()}</span>
          </div>
          ${checklist}
          ${canMoveForward ? `
            <button class="primary-btn stage-forward-btn" onclick="goToAfterView()">개선 후 보기</button>
          ` : ""}
          <div class="message-box" id="messageBox">이동, 씻기, 요리, 신발 신기 같은 일상동작이 어려워지는 지점을 찾아보세요.</div>
        </aside>
      </div>
    </section>
  `;
}

function getSelectedHouseTitle() {
  const house = getSelectedHouse();
  return house ? house.title : "우리집";
}

function getTotalItemCount() {
  return stages.reduce((sum, stage) => sum + stage.items.length, 0);
}

function getAllHomeRiskItems() {
  return stages.flatMap(stage => stage.items.map(item => ({
    id: `${stage.id}-${item.id}`,
    stageTitle: stage.title,
    label: getItemLabel(item)
      .replace("찾아보세요", "")
      .replace("를 ", "")
      .replace("을 ", "")
      .trim()
  })));
}

function renderAnswerRings(stage) {
  return stage.items
    .filter(item => foundItems.includes(item.id))
    .map(item => {
      const point = getItemPoint(item);
      const visualSize = Math.max(Math.min(point.radius * 0.95, 10), 5.5);
      return `
        <div 
          class="answer-ring"
          style="left:${point.x}%; top:${point.y}%; width:${visualSize}%; aspect-ratio:1/1;"
          aria-hidden="true"
        ></div>
      `;
    })
    .join("");
}

function handleImageClick(event) {
  const stage = stages[currentStageIndex];
  const imageArea = document.getElementById("imageArea");
  const stageImage = document.getElementById("stageImage");
  const areaRect = imageArea.getBoundingClientRect();
  const imagePoint = getImageClickPoint(event, stageImage || imageArea);
  if (!imagePoint) return;

  const clickX = imagePoint.x;
  const clickY = imagePoint.y;
  const feedbackX = ((event.clientX - areaRect.left) / areaRect.width) * 100;
  const feedbackY = ((event.clientY - areaRect.top) / areaRect.height) * 100;

  const matchedItem = stage.items.find(item => {
    if (foundItems.includes(item.id)) return false;

    const point = getItemPoint(item);
    const dx = clickX - point.x;
    const dy = clickY - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= point.radius + getTouchRadiusBonus();
  });

  if (matchedItem) {
    handleCorrectClick(matchedItem, feedbackX, feedbackY);
  } else {
    handleWrongClick(feedbackX, feedbackY);
  }
}

function getTouchRadiusBonus() {
  return window.matchMedia("(pointer: coarse), (max-width: 560px)").matches ? 4 : 0;
}

function getImageClickPoint(event, image) {
  const rect = image.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const naturalWidth = image.naturalWidth || rect.width;
  const naturalHeight = image.naturalHeight || rect.height;
  const imageRatio = naturalWidth / naturalHeight;
  const boxRatio = rect.width / rect.height;
  const objectFit = window.getComputedStyle(image).objectFit;

  let contentLeft = rect.left;
  let contentTop = rect.top;
  let contentWidth = rect.width;
  let contentHeight = rect.height;

  if (objectFit === "contain") {
    if (imageRatio > boxRatio) {
      contentHeight = rect.width / imageRatio;
      contentTop += (rect.height - contentHeight) / 2;
    } else {
      contentWidth = rect.height * imageRatio;
      contentLeft += (rect.width - contentWidth) / 2;
    }
  }

  const x = ((event.clientX - contentLeft) / contentWidth) * 100;
  const y = ((event.clientY - contentTop) / contentHeight) * 100;

  if (x < 0 || x > 100 || y < 0 || y > 100) return null;
  return { x, y };
}

function handleCorrectClick(item, x, y) {
  foundItems.push(item.id);
  totalFoundCount += 1;
  safePlay("correct");
  showFeedback("○", x, y, "correct");

  const messageBox = document.getElementById("messageBox");
  if (messageBox) {
    messageBox.innerHTML = `<strong>좋아요!</strong> ${getItemFeedback(item)}`;
  }

  setTimeout(() => {
    const stage = stages[currentStageIndex];

    if (foundItems.length >= stage.items.length) {
      safePlay("clear");
      currentScreen = "afterView";
      render();
    } else {
      renderStage();
    }
  }, 720);
}

function handleWrongClick(x, y) {
  wrongTryCount += 1;
  safePlay("wrong");
  showFeedback("×", x, y, "wrong");

  const messageBox = document.getElementById("messageBox");
  if (messageBox) {
    messageBox.textContent = "다시 찾아보세요! 체크리스트에 적힌 항목을 기준으로 살펴보면 좋아요.";
  }
}

function goToAfterView() {
  const stage = stages[currentStageIndex];
  if (foundItems.length < stage.items.length) return;

  currentScreen = "afterView";
  render();
}

function showFeedback(symbol, x, y, type) {
  const imageArea = document.getElementById("imageArea");
  if (!imageArea) return;

  const mark = document.createElement("div");
  mark.className = `feedback-mark feedback-${type}`;
  mark.textContent = symbol;
  mark.style.left = `${x}%`;
  mark.style.top = `${y}%`;

  imageArea.appendChild(mark);

  setTimeout(() => {
    mark.remove();
  }, 760);
}

function renderAfterView() {
  const stage = stages[currentStageIndex];
  const afterImage = getStageAfterImage(stage);

  const afterItems = stage.items.map(item => `
    <div class="after-item">☑ ${getItemAfterText(item)}</div>
  `).join("");

  app.innerHTML = `
    <section class="screen">
      ${renderBackButton()}
      <div class="after-card">
        <div class="after-top-actions">
          <button class="quit-btn" onclick="quitGame()">점검 종료</button>
        </div>
        <h2>${stage.title} 개선 완료!</h2>
        <img src="${afterImage}" alt="${stage.title} 개선 후 이미지" onerror="fallbackImage(this)">

        <div class="after-list">
          ${afterItems}
        </div>

        <div class="ot-point">
          <strong>작업치료 포인트</strong>
          <span>${stage.otPoint}</span>
        </div>

        <button class="primary-btn" onclick="goToNextStage()">
          ${currentStageIndex === stages.length - 1 ? "결과 보기" : "앞으로: 다음 공간"}
        </button>
      </div>
    </section>
  `;
}

function goToNextStage() {
  if (currentStageIndex >= stages.length - 1) {
    gameAbandoned = false;
    currentScreen = "result";
    render();
    return;
  }

  currentStageIndex += 1;
  foundItems = [];
  currentScreen = "stage";
  render();
}

function getCompletedStageCount() {
  return Math.min(stages.length, Math.floor(totalFoundCount / 3));
}

function quitGame() {
  const shouldQuit = confirm("여기까지 점검하고 중간 결과를 볼까요?");
  if (!shouldQuit) return;

  gameAbandoned = true;
  syncProgressCount();
  currentScreen = "result";
  render();
}

function renderResult() {
  saveResultState();
  const completedStageCount = gameAbandoned ? getCompletedStageCount() : stages.length;
  const completedActivities = completedStageCount > 0
    ? stages.slice(0, completedStageCount).map(stage => stage.activity).join(" · ")
    : "아직 완료한 생활동작은 없지만, 찾은 항목부터 점검 결과에 반영했어요.";
  const homeRiskItems = getAllHomeRiskItems().map(item => `
    <label class="home-risk-item">
      <input type="checkbox" onchange="updateHomeRisk()">
      <span><strong>${item.stageTitle}</strong> ${item.label}</span>
    </label>
  `).join("");

  app.innerHTML = `
    <section class="screen result-screen">
      ${renderBackButton()}
      <div class="panel result-panel">
        <div class="result-ribbon">${gameAbandoned ? "중간 결과" : "클리어 결과"}</div>
        <h2>${gameAbandoned ? "여기까지 점검했어요!" : "우리집 안전점검 완료!"}</h2>
        <p>${getSelectedHouseTitle()} 유형으로 ${gameAbandoned ? "지금까지 찾은 위험요소를 정리했어요." : "출입구, 현관, 거실, 주방, 침실, 욕실의 위험요소를 모두 확인했어요."}</p>
        <p>작업치료는 단순히 위험을 없애는 것이 아니라, 어르신이 실제로 하는 활동을 기준으로 사람에게 맞는 환경과 보조도구를 조정합니다.</p>

        <div class="result-score-board">
          <div class="score-card">
            <span class="score-icon">✓</span>
            <strong>${totalFoundCount}/${getTotalItemCount()}</strong>
            <small>안전 포인트 발견</small>
          </div>
          <div class="score-card">
            <span class="score-icon">★</span>
            <strong>${completedStageCount}/${stages.length}</strong>
            <small>공간 클리어</small>
          </div>
          <div class="score-card">
            <span class="score-icon">↻</span>
            <strong>${wrongTryCount}</strong>
            <small>재도전 횟수</small>
          </div>
        </div>

        <div class="result-actions" aria-label="추가 활동">
          <a class="result-link instagram-link" href="https://www.instagram.com/explore/tags/%EC%9E%91%EC%97%85%EC%B9%98%EB%A3%8C/" target="_blank" rel="noopener">
            <img src="assets/images/instagram-preview.webp" alt="" onerror="fallbackImage(this)">
            <span><strong>인스타그램</strong><small>작업치료와 주거환경 개선 활동 보기</small></span>
          </a>
          <a class="result-link" href="survey.html?return=result"><strong>설문조사</strong><small>네이버폼 준비중</small></a>
          <a class="result-link" href="resources.html?return=result"><strong>더 알아보기</strong><small>관련 정보 제공처</small></a>
        </div>

        <div class="ot-summary">
          <div>
            <strong>활동 기준</strong>
            <span>걷기, 앉고 일어서기, 씻기, 요리하기, 신발 신기</span>
          </div>
          <div>
            <strong>환경수정</strong>
            <span>조명, 동선, 미끄럼방지, 단차 완화, 수납 위치 조정</span>
          </div>
          <div>
            <strong>보조도구</strong>
            <span>안전손잡이, 목욕의자, 긴 구두주걱, 집게, 센서등</span>
          </div>
        </div>

        <div class="report-card">
          <div>
            <strong>오늘 점검한 생활동작</strong>
            <span>${completedActivities}</span>
          </div>
          <div>
            <strong>추천 우선순위</strong>
            <span>욕실 미끄럼방지 → 현관 지지대 → 야간 조명 → 자주 쓰는 물건 위치 조정</span>
          </div>
        </div>

        <div class="home-risk-check">
          <div class="home-risk-head">
            <div>
              <h3>우리 집에는 몇 개가 있나요?</h3>
              <p>아래 항목 중 실제 집에 해당되는 위험요소를 체크해보세요.</p>
            </div>
            <div class="home-risk-score" id="homeRiskScore">0개<br><span>안전군</span></div>
          </div>
          <div class="home-risk-list">
            ${homeRiskItems}
          </div>
          <div class="home-risk-result safe" id="homeRiskResult">
            안전군: 현재 체크된 위험요소가 적습니다. 그래도 욕실, 현관, 야간 이동 경로는 주기적으로 다시 확인해보세요.
          </div>
        </div>

        <button class="primary-btn" onclick="restartGame()">처음 화면으로</button>
      </div>
    </section>
  `;
}

function updateHomeRisk() {
  const checkedCount = document.querySelectorAll(".home-risk-item input:checked").length;
  const score = document.getElementById("homeRiskScore");
  const result = document.getElementById("homeRiskResult");
  if (!score || !result) return;

  let group = "안전군";
  let className = "safe";
  let text = "안전군: 현재 체크된 위험요소가 적습니다. 그래도 욕실, 현관, 야간 이동 경로는 주기적으로 다시 확인해보세요.";

  if (checkedCount >= 4 && checkedCount <= 8) {
    group = "주의군";
    className = "caution";
    text = "주의군: 집 안에서 불편하거나 위험한 부분이 여러 개 보입니다. 자주 쓰는 공간부터 정리, 조명, 미끄럼방지 개선을 시작해보세요.";
  }

  if (checkedCount >= 9) {
    group = "위험군";
    className = "danger";
    text = "위험군: 낙상이나 일상생활 불편 위험이 높을 수 있습니다. 가족, 작업치료사, 보건소, 복지관 등과 함께 주거환경 점검을 받아보는 것이 좋습니다.";
  }

  score.innerHTML = `${checkedCount}개<br><span>${group}</span>`;
  result.className = `home-risk-result ${className}`;
  result.textContent = text;
}

function restartGame() {
  sessionStorage.removeItem(RESULT_STATE_KEY);
  selectedHouse = null;
  selectedHouseCategory = null;
  currentStageIndex = 0;
  foundItems = [];
  totalFoundCount = 0;
  wrongTryCount = 0;
  gameAbandoned = false;
  currentScreen = "main";
  render();
}

function saveResultState() {
  const state = {
    selectedHouse,
    selectedHouseCategory,
    currentStageIndex,
    foundItems,
    totalFoundCount,
    wrongTryCount,
    gameAbandoned
  };

  sessionStorage.setItem(RESULT_STATE_KEY, JSON.stringify(state));
}

function restoreResultState() {
  const shouldRestore = new URLSearchParams(window.location.search).get("return") === "result";
  if (!shouldRestore) return false;

  try {
    const rawState = sessionStorage.getItem(RESULT_STATE_KEY);
    if (!rawState) return false;

    const state = JSON.parse(rawState);
    selectedHouse = state.selectedHouse || null;
    selectedHouseCategory = state.selectedHouseCategory || null;
    currentStageIndex = Number.isFinite(state.currentStageIndex) ? state.currentStageIndex : stages.length - 1;
    foundItems = Array.isArray(state.foundItems) ? state.foundItems : [];
    totalFoundCount = Number.isFinite(state.totalFoundCount) ? state.totalFoundCount : foundItems.length;
    wrongTryCount = Number.isFinite(state.wrongTryCount) ? state.wrongTryCount : 0;
    gameAbandoned = Boolean(state.gameAbandoned);
    currentScreen = "result";

    window.history.replaceState(null, "", "index.html");
    return true;
  } catch (error) {
    sessionStorage.removeItem(RESULT_STATE_KEY);
    return false;
  }
}

restoreResultState();
render();
