import React, {useEffect, useState} from "react";
import "./App.css";
import httpGetAsync from "./httpGetAsync.ts";
import {FaAngleLeft, FaAngleRight} from "react-icons/fa6";
import {IoPlayCircle} from "react-icons/io5";
import {FaGithub, FaLink, FaSitemap} from "react-icons/fa";
import {IconType} from "react-icons";
import {BiLoaderCircle} from "react-icons/bi";

function useMousePosition() {
  const [
    mousePosition,
    setMousePosition
  ] = React.useState({ x: 0, y: 0 });
  React.useEffect(() => {
    const updateMousePosition = (ev: {clientX: number, clientY: number}) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}
function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export default function App() {
  type Data = { [id: string]: Data };

  const databaseUrl = "https://api.github.com/repos/Kostya778899/portfolio-data-1/git/trees/main?recursive=1";
  const rawUrl = "https://raw.githubusercontent.com/Kostya778899/portfolio-data-1/main/";

  const maxDescription = 15;

  const [title, /*setTitle*/] = useState("Portfolio");
  //const [description, setDescription] = useState("desc");

  const [data, setData] = useState<Data>({});
  const [fullscreenContent, setFullscreenContent] = useState<string[]>([]);
  const [showFullscreenContentIndex, setShowFullscreenContentIndex] = useState(0);
  const [load, setLoad] = useState(true);
  const mousePosition = useMousePosition();
  const windowSize = useWindowDimensions();

  useEffect(() => {
    httpGetAsync(databaseUrl, (response: string) => {
      const responseData: Data = {};
      let loads = 0;
      JSON.parse(response).tree.map((e: {path: string}) => {
        function toDataTree(data: Data, path: string) {
          const slashIndex = path.indexOf("/");
          if (slashIndex >= 0)
            toDataTree(data[path.slice(0, slashIndex)], path.slice(slashIndex + 1));
          else {
            data[path] = {};
            const localRawUrl = `${rawUrl}${e.path}`;
            if (path.match(/\.txt$/)) {
              loads++;
              httpGetAsync(localRawUrl, response => {
                data[path][response] = {};
                loads--;
              });
            } else if (path.match(/\.(png|jpg|jpeg|webp|mp4)$/)) {
              data[path][localRawUrl] = {};
            }
            if (loads === 0) {
              setData(responseData);
              setLoad(false);
            }
          }
        }

        toDataTree(responseData, e.path);
      });
      //setData(responseData);
      //setLoad(false);
    });
  }, []);

  useEffect(() => {
    setShowFullscreenContentIndex(0);
  }, [fullscreenContent]);

  return (
    <>
      {load && (() => {
        const depth = 0.1;
        const position = {
          x: (mousePosition.x - windowSize.width / 2) * depth,
          y: (mousePosition.y - windowSize.height / 2) * depth
        };

        return <BiLoaderCircle className={"loader"} size={100} style={{translate: `${position.x}px ${position.y}px`}}/>
      })()}
      {load && <BiLoaderCircle className={"loader"} size={100} style={{translate:
          `${(mousePosition.x - windowSize.width / 2) * 0.1}px ${(mousePosition.y - windowSize.height / 2) * 0.1}px`}}/>}
      <div className="top-bar">
        <h1>{title}</h1>
        {/*<ul>{["Projects", "About"].map((category) => <li key={category}>
          <button className="hover-shine">{category}</button>
        </li>)}</ul>*/}
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
            const icons: {[id: string]: IconType} = {
              "link": FaLink,
              "github": FaGithub,
              "git": FaGithub,
              "site": FaSitemap,
            };
            const links = Object.keys(data[category][project])
              .filter(e => e.match(`^(${Object.keys(icons).join("|")})\\.txt$`));

            const description = Object.keys(data[category][project]).find(e => e === "description.txt") ?
              Object.keys(data[category][project]["description.txt"])[0] : "";

            return <>
              {description && <>
                <p className={"description"}>{
                  description.length <= maxDescription ? description :
                    description.substring(0, maxDescription - 3) + "..."
                }</p>
                <p className={"full-description"}>{description}</p>
              </>}
              {/*<MdOutlineDescription className={"description"} size={25}/>*/}
              <div className={"links"}>{links.map(link =>
                React.createElement(icons[link.slice(0, link.lastIndexOf("."))], {
                  key: link, size: 25, onClick: () =>
                    window.open(Object.keys(data[category][project][link])[0], "_blank")
                })
              )}</div>
            </>
          })()}

          <div className="line"/>

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
