import { useEffect, useState } from "react";
import StarsRate from './components/StarsRate'
import ErrorMessage from "./components/ErrorMessage";
import Loader from "./components/Loader";

const API_KEY = 'dfcc31ea';

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

  function handleWatchedMovies(movie){
    setWatched(prevMovies => [...prevMovies, movie])
  }

  function handleRemoveWatchedMovie(id){
    setWatched(prevMovies => prevMovies.filter(movie => movie.imdbID !== id))
  }

  useEffect(()=>{
    const controller = new AbortController();
    
    async function fetchMovies() {
      try {
        setIsLoading(true)
        setError('')
        const res = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`, {signal: controller.signal})
        
        if (!res.ok) throw new Error('Bad response')
          
        const data = await res.json()

        if (data.Response === 'False') throw new Error(data.Error ?? 'Movies not found');
        
        setMovies(data.Search ?? [])
      } catch (error) { 
        if (error.name !== 'AbortController') {
          setError(error?.message ?? 'Something went wrong')
        }
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

    return () =>{
      controller.abort()
    }
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
            ? <MovieDetails selectedId={selectedId} onHandleSelectFilm={handleSelectFilm} watched={watched} onSetWatched={handleWatchedMovies}/>
            : <WatchedMoviesList watched={watched} onHandleRemoveWatchedMovie={handleRemoveWatchedMovie}/>
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

function MovieDetails({selectedId, onHandleSelectFilm, watched, onSetWatched}){
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)

  const isWatched = watched.map(movie=> movie.imdbID)?.includes(selectedId)
  const watchedUserRaiting = watched.find(movie => movie.imdbID === selectedId)?.userRating

  useEffect(()=>{
    function listener (e){
      if (e.code === 'Escape'){
        onHandleSelectFilm(selectedId)
      }
    }

    document.addEventListener('keydown', listener)

    return ()=>{
      document.removeEventListener('keydown', listener)
    }
  },[onHandleSelectFilm, selectedId])

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

  useEffect(()=>{
    if (movie.Title) document.title = `Movie | ${movie.Title}`

    return ()=>{
      document.title = 'Cinema React'
    }
  }, [movie])

  function handleAddWatchedMovie(){
    const watchedMovie = {
      imdbID: movie.imdbID,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      runtime: Number(movie.Runtime.split(' ').at(0)),
      imdbRating: Number(movie.imdbRating),
      userRating,
    }

    onSetWatched(watchedMovie);
    onHandleSelectFilm(selectedId)
  }

  return (
    <div className="details">
      {isLoading 
        ? <Loader/> 
        : <>
          <header>
            <button className="btn-back" onClick={()=>{onHandleSelectFilm(selectedId)}}>
              &larr;
            </button>
            <img src={movie.Poster} alt={`Poster of ${movie.Title} movie`} />
            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span>⭐️</span>
                {movie.imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched 
                ? <p>You alredy rated this movie with {watchedUserRaiting} ⭐️</p>
                : (
                  <>
                    <StarsRate 
                      key={movie.Title}
                      maxRate={10} 
                      size={24} 
                      onSetRating={setUserRating}
                      // defaultRate={
                        //   movie?.imdbRating && movie.imdbRating !== 'N/A'
                        //     ? Number(movie.imdbRating.slice(0, 1))
                        //     : 0
                        // }
                        />
                      {userRating > 0 && <button className="btn-add" onClick={handleAddWatchedMovie}>+ Add movie to list</button>}
                  </>
                )
              }
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p>Starring {movie.Actors}</p>
            <p>Directed by {movie.Director}</p>
          </section>
      </>}
    </div>
  )
}

function WatchedMoviesList({watched, onHandleRemoveWatchedMovie}){
  return(
    <>
      <WatchedMoviesListSummary watched={watched}/>
      <ul className="list">
        {watched.map((movie) => (
          <WatchedMoviesListMovie key={movie.imdbID} movie={movie} onHandleRemoveWatchedMovie={onHandleRemoveWatchedMovie}/>
        ))}
      </ul>
    </>
  )
}

function WatchedMoviesListSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating)).toFixed(1);
  const avgUserRating = average(watched.map((movie) => movie.userRating)).toFixed(1);
  const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(1);

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

function WatchedMoviesListMovie({movie, onHandleRemoveWatchedMovie}){
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

        <button className="btn-delete" onClick={()=>onHandleRemoveWatchedMovie(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}