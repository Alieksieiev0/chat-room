package main

import (
	"net/http"
	"time"

	"chat_room/internal/server"
)

func main() {
	s := http.Server{
		Addr:         "127.0.0.1:8080",
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 90 * time.Second,
		IdleTimeout:  120 * time.Second,
		Handler:      server.NewWebsocketHandler(),
	}

	err := s.ListenAndServe()
	if err != nil {
		panic(err)
	}
}
