import './page.module.scss'
import '../../lib/icons.scss'

import { demoChat } from "@/app/(marketing)/demo-chat";
import MessageBubble from "@/components/MessageBubble/MessageBubble";

export default function MarketingPage() {
    const possibilities: {name: string, description: string, icon: string, iconColor: string}[] = [
        {
            name: 'Мгновенная доставка',
            description: 'Новые сообщения появляются в открытом чате сами. Своё сообщение видно сразу, ещё до ответа сервера.',
            icon: 'ico-flash',
            iconColor: 'var(--avatar-2)',
        },
        {
            name: 'Группы по ссылке',
            description: 'Создайте группу, отправьте друзьям приглашение — они вступят в один клик, даже если ещё не зарегистрированы.',
            icon: 'ico-group',
            iconColor: 'var(--avatar-5)'
        },
        {
            name: 'Фото в переписке',
            description: 'Прикрепляйте картинки к сообщениям: превью загружаются быстро и не сдвигают ленту.',
            icon: 'ico-photo',
            iconColor: 'var(--avatar-3)'
        }
    ];

    const mechanics: {name: string, description: string}[] = [
        {
            name: 'App Router',
            description: 'Список чатов в лейауте, переписка — в динамическом сегменте'
        },
        {
            name: 'Server Actions',
            description: 'Отправка сообщения без своего API и оптимистичный интерфейс'
        },
        {
            name: 'Server-Sent Events',
            description: 'Route Handler держит поток и доставляет новые сообщения'
        },
        {
            name: 'PostgreSQL',
            description: 'Хранит переписку и сообщает потокам о новых сообщениях'
        }
    ];

    return (
        <div className={'content'}>
            <div className={'content__light-side'}>
                <div className={'content__demo demo'}>
                   <div className={'demo__info'}>
                       <div className={'demo__title'}>
                           <span>Пишите.</span> <span>Вам</span> <span className={'demo__highlight'}>ответят</span>.
                       </div>
                       <div className={'demo__description'}>
                           Мессенджер с личными чатами и группами. Сообщения приходят сразу — без обновления страницы.
                       </div>
                       <div className={'demo__actions'}>
                           <button className={'echo-button size_l primary'}>Начать общение</button>
                           <button className={'echo-button size_l secondary'}>Посмотреть интерфейс</button>
                       </div>
                   </div>

                   <div className={'demo__chat chat'}>
                       <div className={'chat__header'}>
                           <div className={'chat__circle'}>КН</div>
                           <div className={'chat__info'}>
                               <div className={'chat__name'}>Команда Next.js</div>
                               <div className={'chat__participants'}>5 участников, 2 в сети</div>
                           </div>
                       </div>
                       <div className={'chat__zone'}>
                           {demoChat.messages.map((message) => <MessageBubble key={message.id} message={message}/>)}
                       </div>
                       <div className={'chat__message-input'}>
                           <span className={'chat__text-message'}>Сообщение</span>
                           <div className={'chat__send'}>
                               <div className={'ico-send'}></div>
                           </div>
                       </div>
                   </div>
                </div>

                <div id="features" className={'content__possibilities possibilities'}>
                    <div className={'possibilities__title'}>Что умеет</div>
                    <div className={'possibilities__list'}>
                        {possibilities.map((item) =>
                            <div key={item.name} className={'possibilities__item'}>
                                <div style={{backgroundColor: item.iconColor}} className={'possibilities__icon'}>
                                    <div className={item.icon}></div>
                                </div>
                                <div className={'possibilities__name'}>{item.name}</div>
                                <div className={'possibilities__description'}>{item.description}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div id="structure" className={'content__dark-side structure'}>
                <div className={'structure__title'}>Как устроено</div>
                <div className={'structure__description'}>Учебный проект: каждый слой показывает отдельную возможность Next.js.</div>
                <div className={'structure__list'}>
                    { mechanics.map((item, index) =>
                        <div key={item.name} className={'structure__item'}>
                            <div className={'structure__number'}>{index + 1}</div>
                            <div className={'structure__name'}>{item.name}</div>
                            <div className={'structure__feature'}>{item.description}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}