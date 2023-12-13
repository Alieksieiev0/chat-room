package server

import (
	"github.com/gorilla/websocket"
)

type client struct {
	conn *websocket.Conn
}

type room struct {
	Id                 int `json:"id"`
	clients            []*client
	registerClient     chan *client
	unregisterClient   chan *client
	broadcastToClients chan message
}

func (r *room) run() {
	for {
		select {
		case c := <-r.registerClient:
			r.register(c)
		case c := <-r.unregisterClient:
			r.unregister(c)
		case msg := <-r.broadcastToClients:
			r.broadcast(msg)
		}
	}
}

func (r *room) register(c *client) {
	r.clients = append(r.clients, c)
}

func (r *room) unregister(c *client) {
	index := -1
	for i, rc := range r.clients {
		if rc.conn == c.conn {
			index = i
		}
	}

	if index == -1 {
		panic("unexpected room behaviour")
	}

	r.clients = append(r.clients[:index], r.clients[index+1:]...)
	c.conn.Close()
}

func (r *room) broadcast(msg message) {
	for _, c := range r.clients {
		err := c.conn.WriteJSON(msg)
		if err != nil {
			panic(err)
		}
	}
}

func newClient(conn *websocket.Conn) *client {
	return &client{
		conn: conn,
	}
}

func newRoom(id int) *room {
	return &room{
		Id:                 id,
		registerClient:     make(chan *client),
		unregisterClient:   make(chan *client),
		broadcastToClients: make(chan message),
	}
}
