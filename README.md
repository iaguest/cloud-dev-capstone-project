# cloud-dev-capstone-project

cloud-dev-capstone-project is an application built using AWS Lambda and Serverless framework. It is my submission for the final project of the Udacity Cloud Developer Nanodegree course.

# Functionality of the application

* The application allows a watchlist of stock tickers e.g. AAPL, TSLA etc to be created and monitored via a React frontend.

* The application uses the yahoo-finance node.js library to supply the data (see https://www.npmjs.com/package/yahoo-finance). This is available freely to use under an MIT license.

* For each watched item, the UI shows: the stock ticker/symbol, company description, current stock price, currency and timestamp (associated with the displayed price). Alert prices are also shown in square brackets next to the price (if defined). 

* Price alerts can optionally be set for each ticker and the user alerted via e-mail notifications (via Amazon SES) if those levels are crossed. Alerts also show up in red in the UI if they have been triggered.

* A scheduled task updates the watchlist price data every 15mins between 8->16:45 MON->FRI. The data can also be refreshed manually by hitting the refresh button in the UI.

* A user can customize their personal watchlist by clicking the image placeholder and uploading an image file.

# Screenshot

![Alt text](screenshots/screenshot.png?raw=true "Image 1")

# Postman Collection

A postman collection is included to help exercise/test the API directly.
