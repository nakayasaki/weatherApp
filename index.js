const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "frontend")));
const PORT = process.env.PORT || 3000;

app.get("/forecast", async (req, res) => {
  const city = req.query.city;
  const apiKey = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ja`;

  try {
    //API接続してjsonで帰ってくる
    const response = await fetch(url);
    if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`APIリクエスト失敗: ${response.status} ${errorText}`);
  }
    const data = await response.json();

    //今日と明日の文字列を作る
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    //今日と明日のフィルター
    const todayAndTommorrowWeather = data.list.filter(item => {
    const dateStr = item.dt_txt.split(" ")[0];
    return dateStr === todayStr || dateStr === tomorrowStr;
    });

    //朝昼晩のフィルター
    const forecastByDay = {};
    todayAndTommorrowWeather.forEach(item => {
      const [date, time] = item.dt_txt.split(" ");
      if (!forecastByDay[date]) forecastByDay[date] = {};
      if (time === "06:00:00") forecastByDay[date].morning = item;
      if (time === "12:00:00") forecastByDay[date].noon = item;
      if (time === "18:00:00") forecastByDay[date].evening = item;
    });

    //jsonコンソールで見れる
    //console.log(JSON.stringify(forecastByDay, null, 2));
    res.json({ city: data.city.name, forecast: forecastByDay });

  } catch (err) {
  console.error("Fetchエラー:", err);
  res.status(500).json({ error: err.message });
}
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
