import React, { useState, createRef, useEffect } from 'react';
import './style.scss';
import {
  ReplyIcon,
  RetweetIcon,
  LikeIcon,
  ShareIcon,
  VerifiedIcon,
} from './icons';
import { AvatarLoader } from './Loaders';
import { useScreenshot } from 'use-react-screenshot';

function convertImgToBase64(url, callback, outputFormat) {
  var canvas = document.createElement('CANVAS');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback.call(this, dataURL);
    // Clean up
    canvas = null;
  };
  img.src = url;
}

const tweetFormat = (tweet) => {
  tweet = tweet
    .replace(/@([\w]+)/g, '<span>@$1</span>')
    .replace(/#([\wşçğöüıİ]+)/gi, '<span>#$1</span>')
    .replace(/(https?:\/\/[\w\.\/]+)/, '<span>$1</span>');
  return tweet;
};

const formatNumber = (number) => {
  if (!number) {
    number = 0;
  }
  if (number < 1000) {
    return number;
  }
  number /= 1000;
  number = String(number).split('.');
  return (
    number[0] + (number[1] > ',' + 100 ? number[1].slice(0, 1) + ' B' : 'B')
  );
};

export default function App() {
  const TweetRef = createRef(null);
  const downloadRef = createRef();
  const [name, setName] = useState();
  const [username, setUsername] = useState();
  const [isVerified, setIsverified] = useState(true);
  const [tweet, setTweet] = useState();
  const [avatar, setAvatar] = useState();
  const [retweet, setRetweet] = useState(0);
  const [quoteTweets, setQuoteTweets] = useState(0);
  const [likes, setLikes] = useState(0);
  const [image, takeScreenshot] = useScreenshot();
  const getImage = () => takeScreenshot(TweetRef.current);

  useEffect(() => {
    if (image) {
      downloadRef.current.click();
    }
  }, [image]);

  const avatarHandle = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', function () {
      setAvatar(this.result);
    });
    reader.readAsDataURL(file);
  };

  const fetchTwetterInfo = () => {
    fetch(
      `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${username}`
    )
      .then((res) => res.json())
      .then((data) => {
        const twitter = data[0];
        convertImgToBase64(
          twitter.profile_image_url_https,
          function (base64Image) {
            setAvatar(base64Image);
          }
        );
        setName(twitter.name);
        setUsername(twitter.screen_name);
        setTweet(twitter.status.text);
        setRetweet(twitter.status.retweet_count);
        setLikes(twitter.status.favorite_count);
      });
  };

  return (
    <>
      <div className="tweet-settings">
        <h3>Tweet Ayarları</h3>
        <ul>
          <label>Ad Soyad</label>
          <li>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </li>
          <label>Kullanıcı Adı</label>
          <li>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </li>
          <label>Tweet</label>
          <li>
            <textarea
              className="textarea"
              maxLength="290"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
            ></textarea>
          </li>
          <label>Avatar</label>
          <li>
            <input type="file" className="input" onChange={avatarHandle} />
          </li>
          <label>Retweet</label>
          <li>
            <input
              type="number"
              className="input"
              value={retweet}
              onChange={(e) => setRetweet(e.target.value)}
            />
          </li>
          <label>Alıntı Tweet</label>
          <li>
            <input
              type="number"
              className="input"
              value={quoteTweets}
              onChange={(e) => setQuoteTweets(e.target.value)}
            />
          </li>
          <label>Beğeni</label>
          <li>
            <input
              type="number"
              className="input"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
            />
          </li>
          <label>Doğrulanmış Hesap</label>
          <li>
            <select onChange={(e)=>setIsverified(e.target.value)} value={isVerified}>
              <option value="1">Evet</option>
              <option value="0">Hayır</option>
            </select>
          </li>
          <button onClick={getImage}>Oluştur</button>
          <div className="download-url">
            {image && (
              <a ref={downloadRef} href={image} download="tweet.png">
                Tweeti İndir
              </a>
            )}
          </div>
        </ul>
      </div>

      <div className="tweet-container">
        <div className="fetch-info">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tweeter kullanıcı adını girin"
          />
          <button onClick={fetchTwetterInfo}>Bilgileri Çek</button>
        </div>
        <div className="tweet" ref={TweetRef}>
          <div className="tweet-author">
            {(avatar && <img src={avatar} />) || <AvatarLoader />}
            <div>
              <div className="name">
                {name || 'Ad Soyad'}
                {isVerified == 1 && <VerifiedIcon width="19" height="19" />}
              </div>
              <div className="username">@{username || 'kullanıcı adi'}</div>
            </div>
          </div>
          <div className="tweet-content">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  (tweet && tweetFormat(tweet)) ||
                  'Bu alana örnek tweet gelecek',
              }}
            ></p>
          </div>
          <div className="tweet-stats">
            <span>
              <b>{formatNumber(retweet)}</b> Retweet
            </span>
            <span>
              <b>{formatNumber(quoteTweets)}</b> Alıntı Tweetler
            </span>
            <span>
              <b>{formatNumber(likes)}</b> Beğeni
            </span>
          </div>
          <div className="tweet-actions">
            <span>
              <ReplyIcon />
            </span>
            <span>
              <RetweetIcon />
            </span>
            <span>
              <LikeIcon />
            </span>
            <span>
              <ShareIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
