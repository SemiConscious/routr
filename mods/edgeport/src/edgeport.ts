/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/routr
 *
 * This file is part of Routr
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import createSipStack from "./create_sip_stack"
import getServerProperties from "./server_properties"
import { EdgePortConfig } from "./types"

export default function EdgePort(config: EdgePortConfig) {
  this.config = config
  this.start = function() {
    const properties = getServerProperties(config)
    const sipStack = createSipStack(properties)
    //const listeningPoints = createListeningPoints(sipStack, config)
    //const provider = createSIPProvider(sipStack, listeningPoints)
    //provider.addSipListener(listener(config))
  }
}


//create_sip_stack.ts
//create_listening_points.ts
//create_sip_providers.ts
//sip_listener.ts