package server

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"regexp"
	"strconv"

	"github.com/gorilla/websocket"
	"golang.org/x/exp/maps"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var (
	rooms     = map[int]*room{}
	validPath = regexp.MustCompile("^/(rooms)/([0-9]+)$")
)

type message struct {
	Username string `json:"username"`
	Value    string `json:"value"`
}

func NewWebsocketHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "web/templates/index.html")
	})
	mux.HandleFunc("/script/index.js", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "web/static/js/index.js")
	})
	mux.HandleFunc("/rooms", handleRooms)
	mux.HandleFunc("/rooms/", handleRoom)

	return mux
}

func handleRooms(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		sendListOfRooms(w)
	case http.MethodPost:
		rm := newRoom(len(rooms))
		go rm.run()
		rooms[rm.Id] = rm
		w.WriteHeader(http.StatusCreated)
		sendListOfRooms(w)
	}
}

func sendListOfRooms(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(maps.Values(rooms))
	if err != nil {
		log.Println(err)
		return
	}
}

func handleRoom(w http.ResponseWriter, r *http.Request) {
	id, err := getId(r.URL.Path)
	if err != nil {
		log.Println(err)
		http.NotFound(w, r)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	c := newClient(conn)

	rm := rooms[id]
	rm.registerClient <- c

	msg := message{}
	for {
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println(err)
			rm.unregisterClient <- c
			return
		}

		rm.broadcastToClients <- msg
	}
}

func getId(path string) (int, error) {
	m := validPath.FindStringSubmatch(path)
	if m == nil {
		return -1, errors.New("id not found")
	}

	id, err := strconv.Atoi(m[2])
	if err != nil {
		return -1, errors.New("invalid Id")
	}
	return id, nil
}
