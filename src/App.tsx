import React, {useEffect, useRef, useState} from "react";
import "./App.css";
import httpGetAsync from "./httpGetAsync.ts";
import {FaAngleLeft, FaAngleRight} from "react-icons/fa6";
import ReactPlayer from "react-player";
import {IoPlayCircle} from "react-icons/io5";
import {FaGithub, FaLink, FaSitemap} from "react-icons/fa";
import {l} from "vite/dist/node/types.d-aGj9QkWt";

export default function App() {
  const databaseUrl = "https://api.github.com/repos/Kostya778899/portfolio-data-1/git/trees/main?recursive=1";
  const rawUrl = "https://raw.githubusercontent.com/Kostya778899/portfolio-data-1/main/";

  const [title, setTitle] = useState("Portfolio");
  const [description, setDescription] = useState("desc");

  const [data, setData] = useState({});
  const [fullscreenContent, setFullscreenContent] = useState([]);
  const [showFullscreenContentIndex, setShowFullscreenContentIndex] = useState(0);

  useEffect(() => {
    httpGetAsync(databaseUrl, (response: string) => {
      let data = {};

      JSON.parse(response).tree.map((e) => {
        function toDataTree(data, path: string) {
          const slashIndex = path.indexOf("/");
          if (slashIndex >= 0)
            toDataTree(data[path.slice(0, slashIndex)], path.slice(slashIndex + 1));
          else
            data[path] = {};
        }

        toDataTree(data, e.path);
        setData(data);
      });
    });
  }, []);

  useEffect(() => {
    setShowFullscreenContentIndex(0);
  }, [fullscreenContent]);

  return (
    <>
      <div className="top-bar">
        <h1>{title}</h1>
        <ul>{["Projects", "About"].map((category) => <li key={category}>
          <button className="hover-shine">{category}</button>
        </li>)}</ul>
      </div>
      <div className="content">{Object.keys(data).filter(e => !e.includes(".idea")).map((category) => <div className="category" key={category}>
        <h2>{category}</h2>
        <ul>{Object.keys(data[category]).map((project) => <li className="project" key={project}>
          <h3>{project[0] + project
            .slice(1, project.length)
            .split(/(?=[A-Z])/).join(" ")
            .toLowerCase()
            .replace("2 d", " 2D")
            .replace("3 d", " 3D")}</h3>

          {(() => {
            const links = Object.keys(data[category][project]).filter(e => e.match("\\.txt$"));
            const icons = {
              "link": FaLink,
              "github": FaGithub,
              "git": FaGithub,
              "site": FaSitemap,
            };

            return <div className={"links"}>{links.map(link =>
              React.createElement(icons[link.slice(0, link.lastIndexOf("."))], {
                key: link, size: 25, onClick: () => {
                  httpGetAsync(`${rawUrl}${category}/${project}/${link}`, response => {
                    window.open(response, "_blank");
                  });
                }
              })
            )}</div>
          })()}

          {(() => {
            const urls = Object.keys(data[category][project])
              .filter(e => e.match("\\.(png|jpg|jpeg|webp|mp4)$"))
              .map(image => `${rawUrl}${category}/${project}/${image}`.replace("?", "%3F"));

            return <ul key={project} onClick={() => setFullscreenContent(urls)}>{urls.map((url) =>
              url.match("\\.mp4$") &&
                <div key={url} className={"video"}>
                    <video src={url} autoPlay={true} loop={true} muted={true} controls={false}/>
                    <IoPlayCircle className={"play-icon"} size={50}/>
                </div>
              ||
                <img key={url} src={url}/>
            )}</ul>
          })()}

          {/*<ul>{Object.keys(data[category][project]).map((image) =>
            image.slice(image.lastIndexOf(".")) === ".webp" &&
              <img key={image} src={`${rawUrl}${category}/${project}/${image}`} tabIndex={0}/>
          )}</ul>*/}
        </li>)}</ul>
      </div>)}</div>
      {fullscreenContent.length > 0 &&
          <ul className={"fullscreen-content"}>
            {showFullscreenContentIndex > 0 &&
                <FaAngleLeft size={70} onClick={() => setShowFullscreenContentIndex(showFullscreenContentIndex - 1)}/>
              ||
                <FaAngleLeft size={70} className={"off"}/>
            }
            {fullscreenContent[showFullscreenContentIndex].match(".mp4$") &&
                <video src={fullscreenContent[showFullscreenContentIndex]} onClick={() => setFullscreenContent([])} autoPlay={true} muted={true} controls={true}/>
              ||
                <img src={fullscreenContent[showFullscreenContentIndex]} onClick={() => setFullscreenContent([])}/>
            }
            {showFullscreenContentIndex < fullscreenContent.length - 1 &&
                <FaAngleRight size={70} onClick={() => setShowFullscreenContentIndex(showFullscreenContentIndex + 1)}/>
              ||
                <FaAngleRight size={70} className={"off"}/>
            }
          </ul>
      }
    </>
  )
}
