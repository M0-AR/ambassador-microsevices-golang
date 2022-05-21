package models

type KafkaError struct {
	Id    uint
	Key   []byte
	Value []byte
	Error error `json:"error" gorm:"type:text"`
}
