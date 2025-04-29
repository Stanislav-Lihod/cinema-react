import { useEffect, useState } from "react";
import StarsRate from './components/StarsRate'
import ErrorMessage from "./components/ErrorMessage";
import Loader from "./components/Loader";

const API_KEY = 'dfcc31ea';

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  function handleSelectFilm(id){
    setSelectedId(prevId => prevId === id ? null : id)
  }

  useEffect(()=>{
    async function fetchMovies() {

      try {
        setIsLoading(true)
        setError('')
        const res = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`)
        
        if (!res.ok) throw new Error('Bad response')
          
        const data = await res.json()

        if (data.Response === 'False') throw new Error(data.Error ?? 'Movies not found');
        
        setMovies(data.Search ?? [])
      } catch (error) { 
        setError(error?.message ?? 'Something went wrong')
      } finally{
        setIsLoading(false)
      }
    }

    if (query.length < 3) {
      setError('')
      setIsLoading(false)
      return
    }

    fetchMovies()
  }, [query])

  return (
    <>
      <Nav>
        <Search query={query} setQuery={setQuery}/>
        <NavResult movies={movies}/>
      </Nav>
      <Main>
        <Box>
          {!isLoading && !error && <MoviesList movies={movies} onHandleSelectFilm={handleSelectFilm}/>}
          {isLoading && <Loader/>}
          {error && <ErrorMessage message={error}/>}
        </Box>
        <Box>
          {selectedId 
            ? <MovieDetails selectedId={selectedId} onHandleSelectFilm={handleSelectFilm}/>
            : <WatchedMoviesList watched={watched}/>
          }
          {/* <StarsRate maxRate={10} size={20}/>
          <StarsRate size={23} color='red'/> */}
        </Box>
      </Main>      
    </>
  );
}


function Nav({children}){
  
  return(
    <nav className="nav-bar">
      <Logo/>
      {children}
    </nav>
  )
}

function Logo(){
  return(
    <div className="logo">
      <h1>Cinema React</h1>
    </div>
  )
}

function Search({query, setQuery}){  
  return(
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}

function NavResult({movies}){
  return(
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({children}){
  return(
    <main className="main">
      {children}
    </main>
  )
}

function Box({children}){
  const [isOpen, setIsOpen] = useState(true);

  return(
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
}

function MoviesList({movies, onHandleSelectFilm}){
  return(
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <MoviesListMovie movie={movie} key={movie.imdbID} onHandleSelectFilm={onHandleSelectFilm}/>
      ))}
    </ul>
  )
}

function MoviesListMovie({movie, onHandleSelectFilm}){
  return(
    <li onClick={()=> onHandleSelectFilm(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({selectedId, onHandleSelectFilm}){
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(()=>{
    async function getMovie() {
      try {
        setIsLoading(true)
        const res = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedId}`)
       
        if (!res.ok) throw new Error('Bad Request')

        const data = await res.json()        
        setMovie(data)
        setIsLoading(false)
      } catch (error) {
        
      }
      
    }

    getMovie()
  }, [selectedId])

  return (
    <div className="details">
      {isLoading 
        ? <Loader/> 
        : <>
          <header>
            <button className="btn-back" onClick={onHandleSelectFilm(selectedId)}>
              &larr;
            </button>
            <img src={movie['Poster']} alt={`Poster of ${movie['Title']} movie`} />
            <div className="details-overview">
              <h2>{movie['Title']}</h2>
              <p>
                {movie['Released']} &bull; {movie['Runtime']}
              </p>
              <p>{movie['Genre']}</p>
              <p>
                <span>⭐️</span>
                {movie['imdbRating']} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarsRate 
                key={movie['Title']}
                maxRate={10} 
                size={24} 
                defaultRate={
                  movie?.imdbRating && movie.imdbRating !== 'N/A'
                    ? Number(movie.imdbRating.slice(0, 1))
                    : 0
                }/>
            </div>
            <p>
              <em>{movie['Plot']}</em>
            </p>
            <p>Starring {movie['Actors']}</p>
            <p>Directed by {movie['Director']}</p>
          </section>
      </>}
    </div>
  )
}

function WatchedMoviesList({watched}){
  return(
    <>
      <WatchedMoviesListSummary watched={watched}/>
      <ul className="list">
        {watched.map((movie) => (
          <WatchedMoviesListMovie key={movie.imdbID} movie={movie}/>
        ))}
      </ul>
    </>
  )
}

function WatchedMoviesListSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return(
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMoviesListMovie({movie}){
  return(
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  )
}