const express = require("express");
const cors = require("cors");
const { SWIGGY_MENU_API, SWIGGY_RESTAURANTS_API } = require("./constants");

const app = express();

app.use(cors());

// For Restaurants API
app.get("/api/restaurants", async (req, res) => {
  try {
    const { lat, lng, page_type } = req.query;
    const is_seo_page_enabled = req.query["is-seo-page-enabled"];
    const response = await fetch(
      `${SWIGGY_RESTAURANTS_API}?lat=${lat}&lng=${lng}&is-seo-page-enabled=${is_seo_page_enabled}&page_type=${page_type}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    );

    let restaurants = await response.json();
    (restaurants =
      restaurants?.data?.cards?.[4]?.card?.card?.gridElements?.infoWithStyle
        ?.restaurants),
      res.status(200).json({
        status: "success",
        results: restaurants?.length,
        data: {
          restaurants,
        },
      });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `A server error occured, ${err}`,
    });
  }
});

// For Menu API
app.get("/api/menu", async (req, res) => {
  try {
    const { lat, lng, restaurantId } = req.query;
    const page_type = req.query["page-type"];
    const complete_menu = req.query["complete-menu"];

    const response = await fetch(
      `${SWIGGY_MENU_API}?lat=${lat}&lng=${lng}&page-type=${page_type}&complete-menu=${complete_menu}&restaurantId=${restaurantId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    );

    const menu = await response.json();

    const restaurantInfo = menu?.data?.cards?.[0]?.card?.card?.info;
    const categories =
      menu?.data?.cards?.[2]?.groupedCard?.cardGroupMap?.REGULAR?.cards.filter(
        (card) =>
          card?.card?.card?.["@type"] ===
          "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory"
      );

    res.status(200).json({
      status: "success",
      results: menu?.data?.cards?.length,
      data: {
        menu: {
          restaurantInfo,
          categoriesInfo: { results: categories?.length, categories },
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `A server error occured, ${err}`,
    });
  }
});

app.get("/", (req, res) => {
  res.send(
    "Welcome to DishOrder! - See Live Web URL for this Server - https://dishorder-app.netlify.app"
  );
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("listening on port 8080");
});
