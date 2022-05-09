/*
 * Copyright (C) 2022 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/routr
 *
 * This file is part of Routr
 *
 * Licensed under the MIT License (the "License")
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
import { ConnectProcessorConfig } from "./types"
import { MessageRequest } from "@routr/common"
import { LocationClient as Location } from "@routr/location"
import { handleRegister, handleInvite } from "./utils"
import Processor, { Response } from "@routr/processor"

export default function ConnectProcessor(config: ConnectProcessorConfig) {
  const { bindAddr, locationAddr } = config
  const location = new Location({ addr: locationAddr })
  const apiService: any = null

  new Processor({ bindAddr, name: "connect" })
    .listen(async (req: MessageRequest, res: Response) => {
      switch (req.method.toString()) {
        case 'PUBLISH':
        case 'NOTIFY':
        case 'SUBSCRIBE':
          res.sendMethodNotAllowed()
          break
        case 'REGISTER':
          await handleRegister(location)(req, res)
          break
        case 'INVITE':
          await handleInvite(location, apiService)(req, res)
          break
        case 'CANCEL':
          res.sendNotImplemented()
          break
        default:
          res.sendNotImplemented()
      }
    })
}