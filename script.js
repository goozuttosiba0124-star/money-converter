
const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");

const convertButton = document.getElementById("convertButton");
const swapButton = document.getElementById("swapButton");

const result = document.getElementById("result");
const rateText = document.getElementById("rate");
const rateDate = document.getElementById("rateDate");
const errorText = document.getElementById("error");

// 数値を読みやすい形式にする
function formatMoney(value) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 4
  }).format(value);
}

// 為替換算を実行する
async function convertCurrency() {
  const amountText = amountInput.value;
  const money = Number(amountText);

  // 入力チェック
  if (
    amountText.trim() === "" ||
    !Number.isFinite(money) ||
    money < 0
  ) {
    result.textContent = "金額を確認してください";
    rateText.textContent = "";
    rateDate.textContent = "";
    errorText.textContent = "0以上の数値を入力してください。";
    return;
  }

  const from = fromCurrency.value;
  const to = toCurrency.value;

  errorText.textContent = "";
  result.textContent = "換算中...";
  rateText.textContent = "";
  rateDate.textContent = "";
  convertButton.disabled = true;

  try {
    let exchangeRate;
    let date;

    // 同じ通貨なら、APIを呼び出す必要はない
    if (from === to) {
      exchangeRate = 1;
      date = "";
    } else {
      const url =
        `https://api.frankfurter.dev/v2/rate/${from}/${to}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("為替レートを取得できませんでした");
      }

      const data = await response.json();

      exchangeRate = data.rate;
      date = data.date;
    }

    const convertedMoney = money * exchangeRate;

    // 換算結果を表示
    result.textContent =
      `${formatMoney(convertedMoney)} ${to}`;

    // 1単位あたりの為替レートを表示
    rateText.textContent =
      `1 ${from} = ${formatMoney(exchangeRate)} ${to}`;

    // レートの日付を表示
    rateDate.textContent = date
      ? `為替レートの日付：${date}`
      : "同じ通貨のため、換算レートは1です";

  } catch (error) {
    result.textContent = "換算できませんでした";
    rateText.textContent = "";
    rateDate.textContent = "";
    errorText.textContent =
      "通信を確認して、もう一度試してください。";

    console.error("換算エラー:", error);

  } finally {
    convertButton.disabled = false;
  }
}

// 換算ボタンを押したら実行
convertButton.addEventListener("click", convertCurrency);

// 通貨を入れ替える
swapButton.addEventListener("click", () => {
  const previousFrom = fromCurrency.value;

  fromCurrency.value = toCurrency.value;
  toCurrency.value = previousFrom;

  convertCurrency();
});

// 金額や通貨を変更したら自動で再換算
amountInput.addEventListener("input", convertCurrency);
fromCurrency.addEventListener("change", convertCurrency);
toCurrency.addEventListener("change", convertCurrency);

// 最初にアプリを開いたときも換算
convertCurrency();
