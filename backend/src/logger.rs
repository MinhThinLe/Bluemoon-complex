use std::env;
use std::sync::LazyLock;

use log::{Level, LevelFilter, Log};

pub struct Logger;

const RED: &str = "\x1b[0;31m";
const GREEN: &str = "\x1b[0;32m";
const YELLOW: &str = "\x1b[0;33m";
const BLUE: &str = "\x1b[0;34m";
const RESET: &str = "\x1b[0m";

static LOG_LEVEL_LABELS: LazyLock<[String; 6]> = LazyLock::new(|| {
    [
        "[Off]".to_string(),
        format!("{RED}[Error]{RESET}"),
        format!("{YELLOW}[Warn]{RESET}"),
        format!("{GREEN}[Info]{RESET}"),
        format!("{BLUE}[Debug]{RESET}"),
        "[Trace]".to_string(),
    ]
});

impl Log for Logger {
    fn enabled(&self, metadata: &log::Metadata) -> bool {
        metadata.level() <= Level::Info
    }

    fn log(&self, record: &log::Record) {
        let log_label: &str = &LOG_LEVEL_LABELS[record.level() as usize];
        eprintln!("{log_label}: {}", record.args());
    }

    fn flush(&self) {}
}

impl Logger {
    pub fn level() -> Option<LevelFilter> {
        let mut arguments = env::args();
        while let Some(arg) = arguments.next() {
            if arg != "--log-level" {
                continue;
            }
            let Some(log_level) = arguments.next() else {
                eprintln!(
                    "{}: --log-level has to be followed by one of Off, Error, Warn, Info, Debug, Trace (case-insensitive)",
                    LOG_LEVEL_LABELS[Level::Error as usize]
                );
                return None;
            };
            let Ok(result) = log_level.parse() else {
                eprintln!(
                    "{}: --log-level has to be followed by one of Off, Error, Warn, Info, Debug, Trace (case-insensitive), got \"{log_level}\"",
                    LOG_LEVEL_LABELS[Level::Error as usize]
                );
                return None;
            };
            return Some(result);
        }

        Some(LevelFilter::Info)
    }
}
