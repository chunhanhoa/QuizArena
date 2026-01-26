const STORIES = {
  "detective": {
    "startNode": "mansion_front",
    "nodes": {
      "mansion_front": {
        "charName": "Tiềm Thức",
        "visual": "assets/stories/1/1.png",
        "text": "Dinh thự Ravenwood hiện ra trong sương mù. Một cảm giác 'déjà vu' cực độ xâm chiếm: Bạn đã đứng đây hàng ngàn lần. Cửa chính không khóa, nó đang thở - một nhịp thở chậm chạp, nặng nề của gỗ và đá.",
        "choices": [
          { "text": "Bước vào (Tiếp tục vòng lặp)", "next": "main_hall" },
          { "text": "Nhìn qua cửa sổ (Phá vỡ quy luật)", "next": "side_window" },
          { "text": "Kiểm tra hộp thư (Tìm mảnh vỡ)", "next": "mailbox_check" }
        ]
      },
      "mailbox_check": {
        "charName": "Hệ Thống",
        "visual": "assets/stories/1/2.png",
        "text": "Trong hộp thư là một tờ báo đề ngày của... ngày mai: 'Thám tử lừng danh tự sát tại Ravenwood'. Ảnh nạn nhân bị nhòe đi, nhưng chiếc nhẫn trên tay xác chết chính là chiếc bạn đang đeo. Dòng chữ máu viết đè lên: 'Lần này sẽ khác chứ?'",
        "choices": [{ "text": "Đối mặt với định mệnh", "next": "main_hall" }]
      },
      "main_hall": {
        "charName": "Hệ Thống",
        "visual": "assets/stories/1/3.png",
        "text": "Sảnh chính nồng nặc mùi phoóc-môn. Vết máu trên sàn không khô, nó đang bò ngược lên cầu thang như một sinh vật sống. Từ phía trên, tiếng cười của một đứa trẻ vang lên, nhưng âm thanh đó nghe như tiếng kim loại rít trên kính.",
        "choices": [
          { "text": "Lên lầu theo tiếng cười", "next": "upstairs_rush" },
          { "text": "Vào phòng khách tìm manh mối", "next": "living_room" },
          { "text": "Phân tích vệt máu sống", "next": "inspect_blood" }
        ]
      },
      "living_room": {
        "charName": "Di Chúc",
        "visual": "assets/stories/1/4.png",
        "text": "Lò sưởi không có củi nhưng vẫn cháy xanh loét. Tờ di chúc bị đốt dở viết: 'Kẻ thay thế không phải là khách, kẻ thay thế là người đang đọc dòng này'. Bạn chợt nhận ra mình không có bóng trên sàn nhà.",
        "choices": [{ "text": "Chạy lên lầu trong hoảng loạn", "next": "upstairs_rush" }]
      },
      "side_window": {
        "charName": "Thám Tử",
        "visual": "assets/stories/1/5.png",
        "text": "Bên trong, Quản gia đang lau sàn bằng một loại chất lỏng đen kịt. Hắn dừng lại, nhặt một cái răng người dưới thảm, hôn nó rồi nhìn thẳng vào vị trí bạn đang nấp dù rèm cửa đã đóng kín. 'Chào chủ nhân mới', hắn thì thầm.",
        "choices": [
          { "text": "Xông vào khống chế hắn", "next": "arrest_butler" },
          { "text": "Lén theo hắn xuống hầm", "next": "stalk_butler" }
        ]
      },
      "arrest_butler": {
        "charName": "Quản Gia",
        "text": "Gã cười không ra tiếng, để lộ hàm răng trống rỗng: 'Tôi là ký ức của cậu, còn cậu là cơn ác mộng của tôi'. Gã đưa con dao rỉ sét: 'Eleanor không phải người, cô ta là cái lồng. Hãy phá hủy nó!'",
        "choices": [{ "text": "Tìm Eleanor đối chất", "next": "upstairs_rush" }]
      },
      "stalk_butler": {
        "charName": "Hệ Thống",
        "text": "Hắn dẫn bạn xuống hầm rượu, nơi không có rượu, chỉ có hàng trăm lọ thủy tinh chứa những đôi mắt vẫn còn chớp động. Hắn bắt đầu cầu nguyện bằng một ngôn ngữ khiến tai bạn chảy máu.",
        "choices": [{ "text": "Tiến vào trung tâm hầm", "next": "wine_cellar" }]
      },
      "upstairs_rush": {
        "charName": "Eleanor",
        "visual": "assets/stories/1/6.png",
        "text": "Eleanor đứng đó, ôm một bức tượng không đầu. Cô ta đang hát ru: 'Xác thịt là cỏ rác, linh hồn mới trường sinh...'. Khi thấy bạn, cô ta mỉm cười: 'Anh đến để lấy lại cái đầu của mình sao?'",
        "choices": [
          { "text": "Yêu cầu cô ta giải thích", "next": "eleanor_confront" },
          { "text": "Giật lấy bức tượng", "next": "disarm" }
        ]
      },
      "eleanor_confront": {
        "charName": "Eleanor",
        "text": "Hơi thở cô ta lạnh toát: 'Cha tôi cần một cơ thể không biết mình đã chết. Anh hoàn hảo vì anh luôn nghĩ mình đang phá án, trong khi anh đã chết từ 14 kiếp trước'.",
        "choices": [{ "text": "Chạy xuống hầm tìm sự thật", "next": "wine_cellar" }]
      },
      "disarm": {
        "charName": "Cạm Bẫy",
        "text": "Bức tượng vỡ tan, bên trong là những mảnh thẻ ngành thám tử của bạn qua các năm khác nhau. Bạn khựng lại vì sốc, và đó là lúc một sợi dây thừng siết chặt cổ bạn từ bóng tối.",
        "choices": [{ "text": "Bị kéo vào bóng tối", "next": "inspect_blood" }]
      },
      "inspect_blood": {
        "charName": "Bản Sao",
        "visual": "assets/stories/1/7.png",
        "text": "Máu dưới chân bạn bắt đầu định hình thành một bàn tay giữ chặt lấy giày bạn. Một họng súng lạnh ngắt gí vào gáy. Giọng nói của chính bạn vang lên: 'Chào bản sao số 14. Buổi hiến tế bắt đầu'.",
        "choices": [
          { "text": "Đầu hàng định mệnh", "next": "captured" },
          { "text": "Phản công bằng bản năng", "next": "counter_attack" }
        ]
      },
      "counter_attack": {
        "charName": "Sự Thật",
        "visual": "assets/stories/1/8.png",
        "text": "Bạn quật ngã kẻ tấn công. Dưới lớp mặt nạ là khuôn mặt của bạn, nhưng già nua và đầy sẹo. Hắn thào thào: 'Đừng giết Ravenwood... vì hắn chính là hy vọng duy nhất để chúng ta thực sự biến mất'.",
        "choices": [
          { "text": "Xuống hầm kết thúc tất cả", "next": "wine_cellar" },
          { "text": "Bỏ chạy khỏi dinh thự", "next": "mansion_front" }
        ]
      },
      "wine_cellar": {
        "charName": "Ravenwood",
        "visual": "assets/stories/1/9.png",
        "text": "Trong hầm, một thực thể kỳ quái bị xích trên bàn mổ. Gã Luật sư đứng đó, tay cầm kim tiêm chứa thứ dung dịch vàng óng. 'Cơ thể số 14 đã sẵn sàng cho sự tái sinh của Ngài Ravenwood!'",
        "choices": [
          { "text": "Giải cứu thực thể trên bàn", "next": "chase_bad_end" },
          { "text": "Phá hủy toàn bộ phòng thí nghiệm", "next": "rescue_success" }
        ]
      },
      "chase_bad_end": {
        "charName": "Vòng Lặp",
        "text": "Khi bạn chạm vào xích, chúng tự động khóa chặt lấy cổ tay bạn. Luật sư mỉm cười: 'Cảm ơn đã tình nguyện'. Ý thức bạn lịm đi và tỉnh dậy trước cổng dinh thự một lần nữa... Lần thứ 15.",
        "choices": [{ "text": "KHỞI ĐẦU LẠI", "next": "mansion_front" }]
      },
      "rescue_success": {
        "charName": "Kết Thúc?",
        "visual": "assets/stories/1/10.png",
        "text": "Lửa bao trùm căn hầm. Ravenwood tan biến thành tro bụi. Bạn thoát ra ngoài khi mặt trời mọc, nhưng khi soi gương chiếu hậu, bạn thấy mắt mình đã biến thành màu vàng óng của Ravenwood. Vòng lặp đã vỡ, nhưng quỷ dữ đã có nhà mới.",
        "choices": [{ "text": "CHẤP NHẬN DI SẢN", "next": "END" }]
      },
      "captured": {
        "charName": "Bóng Tối",
        "text": "Bạn trở thành một bức tượng đá mới trong hành lang, linh hồn bị kẹt trong lớp thạch cao vĩnh viễn, quan sát bản sao số 15 bước vào.",
        "choices": [{ "text": "RESET VÒNG LẶP", "next": "mansion_front" }]
      }
    }
  },
  "zombie": {
    "startNode": "apartment_start",
    "nodes": {
      "apartment_start": {
        "charName": "Radio",
        "visual": "assets/stories/2/1.png",
        "text": "Sóng radio rè đặc: '...đừng nghe tiếng thì thầm... chúng không phải người thân của bạn...'. Khói đen che phủ mặt trời. Một cơn dịch bệnh không chỉ ăn thịt, mà còn ăn ký ức đang lây lan.",
        "choices": [
          { "text": "Lái xe trốn chạy (Bản năng)", "next": "highway_run" },
          { "text": "Cố thủ (Sự sợ hãi)", "next": "lockdown" },
          { "text": "Lên mái nhà (Quan sát)", "next": "rooftop" }
        ]
      },
      "highway_run": {
        "charName": "Cảnh Tượng",
        "visual": "assets/stories/2/2.png",
        "text": "Đường cao tốc là một nghĩa địa xe hơi khổng lồ. Những xác sống ở đây không vồ vập, chúng đứng im và đồng thanh lẩm bẩm tên của bạn. Làm sao chúng biết bạn là ai?",
        "choices": [
          { "text": "Chiến đấu mở đường", "next": "fight_zombie" },
          { "text": "Trốn vào rừng", "next": "forest_lost" },
          { "text": "Lục soát tìm xăng", "next": "scavenge_car" }
        ]
      },
      "fight_zombie": {
        "charName": "Trận Chiến",
        "text": "Bạn hạ gục một con xác sống, nhưng khi nhìn kỹ, nó có khuôn mặt giống hệt ảnh thẻ trong ví bạn. Sự kinh hãi khiến bạn đứng hình.",
        "choices": [{ "text": "Chạy trốn vào rừng", "next": "forest_lost" }]
      },
      "forest_lost": {
        "charName": "Khu Rừng",
        "text": "Rừng sâu đầy những cái bẫy treo lơ lửng bằng tóc người. Bạn lạc vào vùng 'không gian chết' và trở thành một phần của hệ sinh thái xác sống.",
        "choices": [{ "text": "THỬ LẠI", "next": "apartment_start" }]
      },
      "lockdown": {
        "charName": "Sự Cô Lập",
        "visual": "assets/stories/2/3.png",
        "text": "Cửa đã chèn kín. Người hàng xóm bên kia đường giơ một tấm bảng: 'Đừng nhìn vào gương'. Bạn tò mò quay lại nhìn và thấy khuôn mặt mình đang dần tan chảy.",
        "choices": [
          { "text": "Ra ngoài tìm người giúp", "next": "trade_fail" },
          { "text": "Ngồi im trong bóng tối", "next": "lonely_death" }
        ]
      },
      "trade_fail": {
        "charName": "Phản Bội",
        "text": "Người hàng xóm thực chất là một xác sống vẫn giữ được trí khôn. Hắn lừa bạn ra ngoài để 'thu hoạch' bộ não còn tỉnh táo của bạn.",
        "choices": [{ "text": "Chạy lên mái nhà", "next": "rooftop" }]
      },
      "lonely_death": {
        "charName": "Kết Thúc",
        "text": "Bạn chết vì đói, nhưng tâm trí bạn nhập vào mạng lưới ký ức chung của lũ xác sống ngoài kia. Bạn thấy tất cả.",
        "choices": [{ "text": "HỒI SINH", "next": "apartment_start" }]
      },
      "rooftop": {
        "charName": "Sân Thượng",
        "visual": "assets/stories/2/4.png",
        "text": "Quân đội đang thả những thùng hàng xuống sân vận động, nhưng đó không phải thực phẩm. Đó là những quả bom khí gas để tiêu diệt cả người sống lẫn xác sống.",
        "choices": [
          { "text": "Nhảy sang nhà bên cạnh", "next": "parkour" },
          { "text": "Chế tạo pháo đánh lạc hướng", "next": "distraction" }
        ]
      },
      "parkour": {
        "charName": "Hành Động",
        "text": "Cú nhảy mạo hiểm đưa bạn đến một hầm trú ẩn bí mật của một cựu binh. Ông ta cho bạn một chiếc xe đạp.",
        "choices": [{ "text": "Đạp xe đến căn cứ", "next": "military_end" }]
      },
      "distraction": {
        "charName": "Tiếng Nổ",
        "text": "Lũ xác sống bị thu hút bởi tiếng nổ, để lộ lối vào một cửa hàng cơ khí.",
        "choices": [{ "text": "Tìm phương tiện di chuyển", "next": "scavenge_car" }]
      },
      "scavenge_car": {
        "charName": "Xe Bán Tải",
        "visual": "assets/stories/2/5.png",
        "text": "Chiếc xe còn đầy xăng, nhưng trên vô lăng có dán dòng chữ: 'Chỉ dành cho người chưa bị nhiễm'. Bạn nhìn vết xước trên tay mình...",
        "choices": [
          { "text": "Cố phóng tới căn cứ", "next": "military_end" },
          { "text": "Ghé qua cửa hàng súng", "next": "gun_store" }
        ]
      },
      "gun_store": {
        "charName": "Vũ Khí",
        "text": "Súng đạn đầy mình, nhưng bạn nhận ra vũ khí hiệu quả nhất là giữ cho tâm trí không bị 'xóa sạch' bởi virus.",
        "choices": [{ "text": "Càn quét hướng về sân vận động", "next": "military_end" }]
      },
      "military_end": {
        "charName": "Kết Thúc",
        "visual": "assets/stories/2/6.png",
        "text": "Bạn đến được căn cứ, nhưng họ giam bạn vào lồng sắt. 'Mẫu vật số 14 đã đến'. Hóa ra căn bệnh này là một cuộc thí nghiệm tiến hóa cấp cao.",
        "choices": [{ "text": "TRỞ LẠI", "next": "END" }]
      }
    }
  },
  "cyberpunk": {
    "startNode": "hacker_room",
    "nodes": {
      "hacker_room": {
        "charName": "Jack",
        "visual": "assets/stories/3/1.png",
        "text": "Neon xanh đỏ lấp loáng trên màn hình. Một AI vô danh gửi lời mời: 'Jack, cậu muốn biết tại sao mình không bao giờ già đi không? Xâm nhập Arasaka, tôi sẽ trả lại ký ức thật cho cậu'.",
        "choices": [
          { "text": "Chấp nhận (Tìm sự thật)", "next": "accept_job" },
          { "text": "Truy tìm kẻ gửi (Phản mã)", "next": "trace_sender" },
          { "text": "Liên lạc quân Kháng chiến", "next": "rebel_path" }
        ]
      },
      "trace_sender": {
        "charName": "Hệ Thống",
        "text": "Kẻ gửi mail chính là một phiên bản cũ của chính bạn đã được tải lên mạng lưới từ 10 năm trước. 'Đừng tin vào Arasaka, Jack!'.",
        "choices": [{ "text": "Tích hợp bản sao cũ vào não", "next": "accept_job" }]
      },
      "accept_job": {
        "charName": "Black Ice",
        "visual": "assets/stories/3/2.png",
        "text": "Bạn đã vượt qua tường lửa, nhưng 'Băng Đen' đang đóng băng các neuron thần kinh của bạn. Cơn đau như thể bị khoan vào sọ bằng mũi khoan nhiệt.",
        "choices": [
          { "text": "Dùng lá chắn mã hóa", "next": "encryption_safe" },
          { "text": "Tấn công tự sát (Overload)", "next": "overload" },
          { "text": "Ngắt kết nối vật lý", "next": "disconnected" }
        ]
      },
      "overload": {
        "charName": "Jack Kỹ Thuật Số",
        "text": "Cơ thể bạn cháy sém, nhưng tâm trí bạn đã kịp tràn vào mạng lưới thành phố. Bạn là một bóng ma trong máy móc.",
        "choices": [{ "text": "SỐNG TRONG MẠNG LƯỚI", "next": "END" }]
      },
      "disconnected": {
        "charName": "Thực Tại",
        "text": "Bạn rút dây cắm, máu mũi chảy ròng ròng. Bên ngoài, máy bay không người lái của Arasaka đã khóa mục tiêu vào phòng bạn.",
        "choices": [{ "text": "Bỏ chạy theo phe Kháng chiến", "next": "rebel_path" }]
      },
      "rebel_path": {
        "charName": "Kháng Chiến",
        "visual": "assets/stories/3/3.png",
        "text": "Phe kháng chiến muốn bạn cài 'Virus Tự Do' - thứ sẽ xóa sổ mọi tài khoản ngân hàng và nợ nần, đưa thế giới về thời kỳ đồ đá kỹ thuật số.",
        "choices": [
          { "text": "Kích hoạt Virus (Anarchy)", "next": "anarchy_end" },
          { "text": "Bán đứng Kháng chiến", "next": "betrayal_death" }
        ]
      },
      "anarchy_end": {
        "charName": "Kỷ Nguyên Mới",
        "text": "Thành phố tối sầm. Các tập đoàn sụp đổ. Bạn đứng trên sân thượng, mỉm cười khi thấy thế giới rực cháy trong sự tự do điên cuồng.",
        "choices": [{ "text": "KẾT THÚC", "next": "END" }]
      },
      "betrayal_death": {
        "charName": "Thanh Trừng",
        "text": "Arasaka nhận dữ liệu nhưng thay vì trả tiền, họ gửi một sát thủ đến để 'dọn dẹp' đầu mối cuối cùng. Phản bội không có tương lai.",
        "choices": [{ "text": "REBOOT", "next": "hacker_room" }]
      },
      "encryption_safe": {
        "charName": "Dữ Liệu Gốc",
        "visual": "assets/stories/3/4.png",
        "text": "Bạn thấy danh sách 'Sản phẩm linh hồn'. Tên bạn ở vị trí thứ 2048. Arasaka không hồi sinh người chết, họ chỉ copy-paste ý thức vào các robot sinh học.",
        "choices": [
          { "text": "Công bố cho thế giới", "next": "hero_end" },
          { "text": "Tự nâng cấp bản thân thành thần", "next": "rich_end" }
        ]
      },
      "hero_end": {
        "charName": "Người Hùng",
        "visual": "assets/stories/3/5.png",
        "text": "Dữ liệu được phát tán. Nhân loại bàng hoàng khi biết mình chỉ là những bản copy. Bạn bị truy nã gắt gao nhất lịch sử, nhưng bạn đã cho họ sự thật.",
        "choices": [{ "text": "KHỞI ĐỘNG LẠI", "next": "hacker_room" }]
      },
      "rich_end": {
        "charName": "Thực Tại Ảo",
        "text": "Bạn chuyển hết tiền vào tài khoản bí mật, mua một hòn đảo ảo trong Metaverse và sống như một vị thần, bỏ mặc thế giới thực thối nát.",
        "choices": [{ "text": "GHI NHẬN", "next": "END" }]
      }
    }
  }
}

let currentStory = null;
let currentNode = null;
let isTyping = false;

function startStory(id) {
    currentStory = STORIES[id];
    if (!currentStory) return alert("Dữ liệu cốt truyện đang được mã hóa, vui lòng thử lại sau!");
    
    const overlay = document.getElementById('storyOverlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
        renderNode(currentStory.startNode);
    }, 10);
}

function typeWriter(text, elementId, speed = 30) {
    isTyping = true;
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            isTyping = false;
            document.getElementById('choiceGrid').style.opacity = '1';
        }
    }
    type();
}

function renderNode(nodeId) {
    if (nodeId === 'END') return exitStory();
    if (nodeId === 'back_intro') return renderNode(currentStory.startNode);
    
    currentNode = currentStory.nodes[nodeId];
    if (!currentNode) return alert("Lỗi logic cốt truyện! Nút rẽ nhánh không tồn tại.");

    const dialogueBox = document.getElementById('dialogueText');
    const visualBox = document.getElementById('storyVisual');
    const choiceGrid = document.getElementById('choiceGrid');
    
    // Reset state before showing new content
    dialogueBox.style.opacity = '0';
    choiceGrid.style.opacity = '0';
    visualBox.style.transform = 'scale(1)';
    
    setTimeout(() => {
        document.getElementById('charName').innerText = currentNode.charName;
        
        if (currentNode.visual) {
            visualBox.style.backgroundImage = `url('${currentNode.visual}')`;
            visualBox.style.transform = 'scale(1.05)';
        }

        // Create buttons first but keep hidden
        choiceGrid.innerHTML = '';
        currentNode.choices.forEach((choice, idx) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `<span>${String.fromCharCode(65 + idx)}</span> ${choice.text}`;
            btn.onclick = () => {
                if (isTyping) return; // Prevent clicking while typing
                renderNode(choice.next);
            };
            choiceGrid.appendChild(btn);
        });

        dialogueBox.style.opacity = '1';
        typeWriter(currentNode.text, 'dialogueText');
    }, 400);
}

function exitStory() {
    const overlay = document.getElementById('storyOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 800);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('storyOverlay');
    if (overlay.style.display === 'flex' && !isTyping) {
        const buttons = document.querySelectorAll('.choice-btn');
        if (e.key.toLowerCase() === 'a' || e.key === '1') buttons[0]?.click();
        if (e.key.toLowerCase() === 'b' || e.key === '2') buttons[1]?.click();
        if (e.key.toLowerCase() === 'c' || e.key === '3') buttons[2]?.click();
        if (e.key === 'Escape') exitStory();
    }
});