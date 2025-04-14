import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu } from "lucide-react";
import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: "https://graphql.anilist.co",
});

export default function Home() {
  const [animeList, setAnimeList] = useState([]);
  const [watchList, setWatchList] = useState(
    JSON.parse(localStorage.getItem("watchList")) || []
  );
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState("home");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    fetchAnimes();
  }, []);

  useEffect(() => {
    localStorage.setItem("watchList", JSON.stringify(watchList));
  }, [watchList]);

  const fetchAnimes = async () => {
    const query = `{
      Page(perPage: 50) {
        media(type: ANIME) {
          id
          title {
            romaji
          }
          coverImage {
            large
          }
          description(asHtml: false)
        }
      }
    }`;
    const { data } = await AxiosInstance.post("", { query });
    setAnimeList(data.data.Page.media);
  };

  const handleSearch = async () => {
    if (!search) return;
    const query = `{
      Page(perPage: 50) {
        media(search: "${search}", type: ANIME) {
          id
          title {
            romaji
          }
          coverImage {
            large
          }
          description(asHtml: false)
        }
      }
    }`;
    const { data } = await AxiosInstance.post("", { query });
    setAnimeList(data.data.Page.media);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleWatchlist = (anime) => {
    const exists = watchList.find((a) => a.id === anime.id);
    if (exists) {
      setWatchList(watchList.filter((a) => a.id !== anime.id));
    } else {
      setWatchList([...watchList, anime]);
    }
  };

  const listToDisplay = section === "home" ? animeList : watchList;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <div className="flex justify-between items-center px-6 py-4 shadow-md bg-zinc-800 text-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold">AniShelf</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-white">
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
            <Menu />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex justify-center py-4 gap-6">
          <Button variant="outline" onClick={() => setSection("home")}>Home</Button>
          <Button variant="outline" onClick={() => setSection("watchlist")}>Watchlist</Button>
        </div>
      )}

      <div className="flex justify-center items-center flex-col gap-4 py-4">
        <Input
          placeholder="Search for anime..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-md text-black"
        />
        <Button onClick={handleSearch} className="bg-zinc-900 text-white hover:bg-zinc-700">
          Search
        </Button>
      </div>

      <div className="grid gap-6 px-4 py-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {listToDisplay.map((anime) => (
          <Card key={anime.id} className="overflow-hidden cursor-pointer" onClick={() => setSelectedAnime(anime)}>
            <img src={anime.coverImage.large} alt={anime.title.romaji} className="w-full h-60 object-cover" />
            <CardContent className="text-center p-2 font-semibold">
              {anime.title.romaji}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAnime && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-lg text-white p-6 flex flex-col items-center justify-center z-50 overflow-auto">
          <img src={selectedAnime.coverImage.large} alt={selectedAnime.title.romaji} className="w-60 h-auto mb-4 rounded-xl" />
          <h2 className="text-2xl font-bold mb-2">{selectedAnime.title.romaji}</h2>
          <p className="max-w-xl text-center mb-6">{selectedAnime.description}</p>
          <div className="flex gap-4">
            <Button
              onClick={() => toggleWatchlist(selectedAnime)}
              className="bg-blue-900 text-white px-4"
            >
              {watchList.find((a) => a.id === selectedAnime.id) ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
            <Button
              onClick={() => setSelectedAnime(null)}
              className="bg-white !text-black border border-zinc-400 px-4"
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
