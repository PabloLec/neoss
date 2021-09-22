#!/usr/bin/env node

import { initialize } from "./ui/screen";
import { getStats } from "./utils/getStats";

initialize();
getStats();
