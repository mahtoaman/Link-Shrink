const UrlModel = require("../models/urlModel");
const shortid = require("shortid");
const axios = require("axios"); //
const redis = require("redis"); //for reddish
const { promisify } = require("util");

//==================================REDIS IMPLEMENTATION===========================

const redisClient = redis.createClient("redis://red-chm70bm4dad6k5mphns0:6379");

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//==================================create-api===========================>>>

const shortUrl = async (req, res) => {
  try {
    const longUrl = req.body.longUrl;
    if (!longUrl)
      return res.status(400).send({
        status: false,
        message: "Please enter long URL",
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
      .catch((err) => {
        console.log(err);
      });

    if (flag == false)
      return res.status(400).send({ status: false, message: "Invalid URL" });

    let urldata = await GET_ASYNC(`${longUrl}`);
    let data = JSON.parse(urldata);

    if (data)
      return res.status(201).send({
        status: true,
        message: `URL is already shortened`,
        data: data,
      });

    let urlExist = await UrlModel.findOne({ longUrl });
    if (urlExist) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(urlExist));
      return res.status(401).send({
        status: false,
        message: "URL is already shortened",
        data: data,
      });
    }

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
      await SET_ASYNC(`${urlCode}`, JSON.stringify(getPage));
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
