import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import GlobalStyle from "../styles/styles";
import { Ionicons } from "@expo/vector-icons";

import "../../FirebaseConfig";
import { getAuth } from "firebase/auth";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

import MovieDetails from "../components/MovieDetails";

import { useSelector, useDispatch } from "react-redux";
import moviesSlice, {
  fetchMovies,
  deleteMovie,
  updateMovie,
} from "../moviesSlice";
import { AppDispatch, RootState } from "../store";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const Home: React.FC<Props> = ({ navigation }) => {
  //const [movies, setMovies] = useState<any[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const movies = useSelector((state: RootState) => state.movies.movies);
  const movieStatus = useSelector((state: RootState) => state.movies.status);

  const auth = getAuth();
  const signOutUser = () => {
    auth
      .signOut()
      .then(() => {
        navigation.navigate("LogIn");
        navigation.reset;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error logging out: ", errorCode, errorMessage);
      });
  };

  //Now that we got some data in our first collection, we can also load data when the app starts using useEffect.
  //Will load the data once & listen to changes on collection reference
  useEffect(() => {
    if (movieStatus === "idle") {
      dispatch(fetchMovies());
    }
  }, [movieStatus, dispatch]);

  const [expandState, setExpandState] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleExpand = (movieId: string) => {
    setExpandState((prevState) => ({
      [movieId]: !prevState[movieId],
    }));
  };

  const renderMovie = ({ item }: any) => {
    const handleSave = async (myThoughts: string) => {
      try {
        await dispatch(
          updateMovie({
            movieId: item.ID,
            newData: myThoughts,
          })
        ).unwrap();
        alert("Saved!");
      } catch (error) {
        console.error(`Error saving ${item.title}: `, error);
      }
    };
    const handleDelete = () => {
      dispatch(deleteMovie(item));
    };
    const isExpanded = expandState[item.ID];

    return (
      <View style={styles.movieCollapsedBox}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: `100%`,
          }}
        >
          <Text style={GlobalStyle.details}>{item.title}</Text>
          <TouchableOpacity onPress={() => toggleExpand(item.ID)}>
            {isExpanded ? (
              <Ionicons name="chevron-up-outline" color="green" />
            ) : (
              <Ionicons name="chevron-down-outline" color="green" />
            )}
          </TouchableOpacity>
        </View>
        {isExpanded && (
          <MovieDetails
            movie={item}
            onSave={handleSave}
            onDelete={handleDelete}
            showDelete={true}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={GlobalStyle.titleText}>My Movie Recs</Text>
        <TouchableOpacity
          style={GlobalStyle.button}
          onPress={() => navigation.navigate("AddNewMovie")}
        >
          <Text style={GlobalStyle.buttonText}>Add New Movie</Text>
        </TouchableOpacity>

        <View style={styles.moviesContainer}>
          {movies.length > 0 && (
            <FlatList
              data={movies}
              renderItem={renderMovie}
              keyExtractor={(movie) => movie.id}
              // removeClippedSubviews={true}
            />
          )}
        </View>
        <TouchableOpacity
          style={[
            GlobalStyle.buttonOutline,
            {
              width: "auto",
              paddingHorizontal: 20,
              height: "auto",
              alignSelf: "center",
              marginTop: `10%`,
            },
          ]}
          onPress={() => signOutUser()}
        >
          <Text style={[GlobalStyle.buttonText, { color: "gray" }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    alignItems: "baseline",
    height: `80%`,
    width: "80%",
  },
  scrollViewContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },

  moviesContainer: {
    padding: `10%`,
    marginTop: 15,
    backgroundColor: "#F6F4F4",
    borderRadius: 8,
    height: `80%`,
    width: `100%`,
  },
  movieCollapsedBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    width: `100%`,
    height: `auto`,
    alignItems: "flex-start",
    marginBottom: 10,
    padding: 10,
  },
});

export default Home;
