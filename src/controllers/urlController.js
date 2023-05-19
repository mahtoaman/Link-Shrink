const UrlModel = require("../models/urlModel");
const shortid = require("shortid");
const axios = require("axios"); //

//==================================create-api===========================>>>

const shortUrl = async (req, res) => {
  try {
    const longUrl = req.body.longUrl;
    if (!longUrl)
      return res.status(400).send({
        status: false,
        message: "Long URL should be present in the request body",
      });

    let flag = false;
    let options = {
      method: "get",
      url: longUrl,
    };

    let resultt = await axios(options)
      .then((res) => {
        if (res.status == 201 || res.status == 200) flag = true;
      })
      .catch((err) => {console.log(err)});

    if (flag == false) return res.status(400).send({ status: false, message: "Invalid URL"});

    let urlCode = shortid.generate();
    let shortUrl = `${req.protocol}://${req.headers.host}/` + urlCode;

    let result = { longUrl: longUrl, shortUrl: shortUrl, urlCode: urlCode };

    await UrlModel.create(result);
    return res
      .status(201)
      .send({ status: true, message: "Created", data: result });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

//==================================get-api==============================>>>

const getUrl = async (req, res) => {
  try {
    let urlCode = req.params.urlCode;

    const getPage = await UrlModel.findOne({ urlCode: urlCode });
    if (getPage) {
      console.log("mongodb call");
      return res.status(302).redirect(getPage.longUrl);
    }
    return res
      .status(404)
      .send({ status: false, message: "urlCode does not exist" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: false, Error: err.message });
  }
};

module.exports = { shortUrl, getUrl };
