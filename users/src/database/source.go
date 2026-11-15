package database

import "os"

// SourceDSN returns the DSN used by the optional data-population commands.
// It is intentionally separate from the service database so operators can
// copy data from a staging or legacy database without hard-coding credentials.
func SourceDSN() string {
	dsn := os.Getenv("SOURCE_DB_DSN")
	if dsn == "" {
		panic("SOURCE_DB_DSN is required (example: user:password@tcp(localhost:3306)/ambassador)")
	}
	return dsn
}
