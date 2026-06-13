let firstCartItem;

// fetch the cart and set the first product + if the firstProduct is not empty we call the recommendations
function fetchCart() {
  return fetch("/cart.js")
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      firstCartItem = data.items.length > 0 ? data.items[0] : null;
      if (firstCartItem !== null) {
        fetchAndPrintRecommendations();
      }
    })
    .catch((error) => {
      console.error("Error fetching cart:", error);
      firstCartItem = null;
    });
}

// 'listen' when there's a product added to cart or the cart changes
function interceptCart() {
  const originalFetch = window.fetch;
  window.fetch = function () {
    return originalFetch.apply(this, arguments).then((response) => {
      if (
        response.url.includes("/cart/add") ||
        response.url.includes("/cart/change")
      ) {
        fetchCart();
      }
      return response;
    });
  };
}

interceptCart();

// fetch recommended products
function fetchAndPrintRecommendations() {
  fetch(
    window.Shopify.routes.root +
      `recommendations/products.json?product_id=${firstCartItem.product_id}&limit=6&intent=related`
  )
    .then((response) => response.json())
    .then(({ products }) => {
      if (products.length > 0) {
        // const firstRecommendedProduct = products[0];
        setTimeout(() => {
          printRecommendations(products);
        }, 500);
      }
    })
    .catch((error) => {
      console.error("Error fetching recommendations:", error);
    });
}

// limit the product title in recommendations
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

// build the html and print recomendations
function printRecommendations(products) {
  const recommendations = document.querySelector("#recommendations_print");
  const atcText = recommendations.dataset.add;
  const header = recommendations.dataset.title;
  const currency = recommendations.dataset.currency;
  const newProducts = products.slice(0, 6);
  let recommendationsElements = "";
  const base_url = window.location.origin;

  // const base_url = {{ shop.url }};

  newProducts.forEach((product) => {
    const formatedPrice = (product.price / 100)
      .toLocaleString("en-US")
      .replace(".", ",");
    let formatedComparePrice = "";
    let currencySymbol;
    if (currency === "USD") {
      currencySymbol = "$";
    } else if (currency === "EUR") {
      currencySymbol = "€";
    } else {
      currencySymbol = currency;
    }

    if (product.compare_at_price != 0) {
      formatedComparePrice = (product.compare_at_price / 100)
        .toLocaleString("en-US")
        .replace(".", ",");
    }
    const availableVariant = product.variants.find(
      (variant) => variant.available
    );
    if (availableVariant) {
      recommendationsElements += `
          <div class="rec-product-container">
              <a href="${
                base_url + product.url
              }" class="recommendations-carousel__item">
                  <img src="${product.featured_image}" alt="">
              </a>
              <div class="rec-product">
                <p><a href="${base_url + product.url}"> ${truncateText(
        product.title,
        20
      )}</a></p>
                <p>
                  ${
                    formatedComparePrice
                      ? `<span class="normal-price">€${formatedPrice}</span> ${formatedComparePrice > 0 ? '<span class="compare-price">€' + formatedComparePrice + '</span>' : ''}`
                      : `${currencySymbol}${formatedPrice}`
                  }
                </p>
                <div class="rec-btn">
                  <a onclick="recAddToCart(${
                    availableVariant.id
                  });" class="link text-xs boxy--to__cart">${atcText}</a>
                </div>
              </div>
          </div>
        `;
    }
  });

  const recommendationsContent = `
      <div class="recommendations-carousel">
          <h3>${header}</h3>
          <div class="recommendations-carousel__general">
              <div class="recommendations-carousel__move">
                  ${recommendationsElements}
              </div>
          </div>
      </div>
    `;

  recommendations.innerHTML = recommendationsContent;
  const recommendationsAux = document.querySelector('#recommendations_print_aux');
recommendationsAux.innerHTML = recommendationsContent;
}

// custom add to cart for the printed recommendation products
function recAddToCart(productId) {
  fetch("/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: productId,
      quantity: 1,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      document.documentElement.dispatchEvent(
        new CustomEvent("cart:refresh", {
          bubbles: true,
        })
      );
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

addEventListener("load", (event) => {
  fetchCart();
});
